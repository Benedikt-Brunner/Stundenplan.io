#![allow(clippy::needless_return)]
use crate::auth::{resolve_auth_state, AuthState, User};
use crate::{Database, Random};
use axum::response::IntoResponse;
use axum::Extension;
use axum::Json;
use http::{header, HeaderValue, Response, StatusCode};
use http_body_util::Empty;
use http_body_util::Full;
use include_dir::{include_dir, Dir};
use password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString};
use pbkdf2::Pbkdf2;
use rand_core::{OsRng, RngCore};
use serde::{Deserialize, Serialize};
use sqlx::postgres::PgRow;
use sqlx::types::JsonValue;
use sqlx::{Error, FromRow, Row};
use std::fmt::{Display, Formatter};

static STATIC_STYLES_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/Styles");

#[derive(Deserialize, Serialize, Debug)]
pub enum Styles {
    Light,
    Dark,
    Pink,
    Custom(String),
}

impl Display for Styles {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Styles::Light => write!(f, "Light"),
            Styles::Dark => write!(f, "Dark"),
            Styles::Pink => write!(f, "Pink"),
            Styles::Custom(custom) => write!(f, "{}", custom),
        }
    }
}

#[derive(Deserialize, Serialize, Debug)]
pub struct StylesPayload {
    style: Styles,
}

#[derive(Deserialize, Clone)]
pub struct CreateUser {
    username: String,
    password: String,
}

#[derive(Debug, Deserialize, Serialize, FromRow, Clone)]
pub struct UserData {
    username: String,
    schedule: UserSchedule,
    meta: UserMetadata,
    friends: Vec<String>,
    friend_requests: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize, FromRow, Clone)]
pub struct UserMetadata {
    buddy: String,
    rows: i32,
    days: bool,
    theme: String,
    template: String,
    language: String,
    show_teacher: bool,
    show_room: bool,
    show_subject: bool,
}

#[derive(Deserialize, Serialize, Debug, FromRow, Clone)]
pub struct UserSchedule {
    schedule: JsonValue,
}

#[derive(Debug, Serialize, FromRow, Clone)]
pub struct Friend {
    username: String,
    schedule: JsonValue,
    pending: bool,
    personal_grouping: Option<String>,
}

#[derive(Debug, FromRow, Clone)]
pub struct UsernameWrapper {
    username: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct AddGroupRequestPayload {
    friend: String,
    personal_grouping: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct GenericFriendActionPayload {
    friend_name: String,
}

pub async fn styles(Json(payload): Json<StylesPayload>) -> impl IntoResponse {
    // if custom styles are supported in the future match if style is custom here and implement any custom logic e.g. database calls, remote file fetching etc.
    // for now it will just try to access the inner value as a file which will probably fail
    let path = payload.style.to_string() + ".json";

    let file = match STATIC_STYLES_DIR.get_file(path) {
        None => {
            return Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body(Full::from("test"))
                .unwrap()
        }
        Some(file) => file,
    };

    Response::builder()
        .status(StatusCode::OK)
        .header(
            header::CONTENT_TYPE,
            HeaderValue::from_str("application/json").unwrap(),
        )
        .body(Full::from(file.contents()))
        .unwrap()
}

pub async fn get_user_data(Extension(auth): Extension<AuthState>) -> impl IntoResponse {
    let (user, db) = match resolve_auth_state(auth).await {
        Ok(res) => res,
        Err(status_code) => return status_code.into_response(),
    };

    const USERNAME_QUERY: &str = "SELECT username from users where id = $1;";
    const SCHEDULE_QUERY: &str = "SELECT schedule FROM users Where id = $1;";
    const META_QUERY: &str = "SELECT buddy, rows, days, theme, template, language, show_teacher, show_subject, show_room FROM meta Join users ON user_id = id Where id = $1;";
    const FRIENDS_QUERY: &str = "SELECT u.username, u.schedule, f.pending, f.personal_grouping FROM friends f JOIN users u ON f.friend = u.id AND f.created_by <> $1 AND f.userr = $1;";

    let username_data = sqlx::query_as::<_, UsernameWrapper>(USERNAME_QUERY)
        .bind(user.id)
        .fetch_one(&db)
        .await;

    let username = match username_data {
        Ok(res) => res.username,
        Err(err) => {
            println!("Err: {}", err);

            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    let schedule_data = sqlx::query_as::<_, UserSchedule>(SCHEDULE_QUERY)
        .bind(user.id)
        .fetch_one(&db)
        .await;

    let schedule = match schedule_data {
        Ok(res) => res,
        Err(err) => {
            println!("Err: {}", err);

            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    let meta_data = sqlx::query_as::<_, UserMetadata>(META_QUERY)
        .bind(user.id)
        .fetch_one(&db)
        .await;

    let meta = match meta_data {
        Ok(res) => res,
        Err(err) => {
            println!("Err: {}", err);

            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    let friends_data = sqlx::query_as::<_, Friend>(FRIENDS_QUERY)
        .bind(user.id)
        .fetch_all(&db)
        .await;

    let (friends, friend_requests): (Vec<String>, Vec<String>) = match friends_data {
        Ok(res) => {
            let friends = res
                .iter()
                .filter_map(|friend| {
                    if !friend.pending {
                        Some(friend.clone().username)
                    } else {
                        None
                    }
                })
                .collect();

            let friend_requests = res
                .iter()
                .filter_map(|friend| {
                    if friend.pending {
                        Some(friend.clone().username)
                    } else {
                        None
                    }
                })
                .collect();

            (friends, friend_requests)
        }
        Err(err) => {
            println!("Err: {}", err);

            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    Json(UserData {
        username,
        schedule,
        meta,
        friends,
        friend_requests,
    })
    .into_response()
}

pub async fn get_schedule(Extension(auth): Extension<AuthState>) -> impl IntoResponse {
    let (user, db) = match resolve_auth_state(auth).await {
        Ok(res) => res,
        Err(status_code) => return status_code.into_response(),
    };

    const SCHEDULE_QUERY: &str = "SELECT schedule FROM users Where id = $1;";

    let schedule_data = sqlx::query_as::<_, UserSchedule>(SCHEDULE_QUERY)
        .bind(user.id)
        .fetch_one(&db)
        .await;

    let schedule = match schedule_data {
        Ok(res) => res,
        Err(err) => {
            println!("Err: {}", err);

            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    Json(schedule).into_response()
}

pub async fn persist_schedule(
    Extension(auth): Extension<AuthState>,
    body: String,
) -> impl IntoResponse {
    let (user, db) = match resolve_auth_state(auth).await {
        Ok(res) => res,
        Err(status_code) => return status_code.into_response(),
    };

    let schedule = match Json::<JsonValue>::from_bytes(body.as_bytes()) {
        Ok(res) => res,
        Err(_) => return StatusCode::BAD_REQUEST.into_response(),
    };

    const WRITE_SCHEDULE_QUERY: &str = "UPDATE users SET schedule = $2 WHERE id = $1;";

    let res = sqlx::query(WRITE_SCHEDULE_QUERY)
        .bind(user.id)
        .bind(schedule.0)
        .execute(&db)
        .await;

    return match res {
        Ok(_) => StatusCode::OK.into_response(),
        Err(err) => {
            println!("Err: {}", err);

            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    };
}

pub async fn get_metadata(Extension(auth): Extension<AuthState>) -> impl IntoResponse {
    let (user, db) = match resolve_auth_state(auth).await {
        Ok(res) => res,
        Err(status_code) => return status_code.into_response(),
    };

    const META_QUERY: &str = "SELECT buddy, rows, days, theme, template, language, show_teacher, show_subject, show_room FROM meta Join users ON user_id = id Where id = $1;";

    let meta_data = sqlx::query_as::<_, UserMetadata>(META_QUERY)
        .bind(user.id)
        .fetch_one(&db)
        .await;

    let meta = match meta_data {
        Ok(res) => res,
        Err(err) => {
            println!("Err: {}", err);

            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    Json(meta).into_response()
}

pub async fn persist_metadata(
    Extension(auth): Extension<AuthState>,
    Json(payload): Json<UserMetadata>,
) -> impl IntoResponse {
    let (user, db) = match resolve_auth_state(auth).await {
        Ok(res) => res,
        Err(status_code) => return status_code.into_response(),
    };

    const WRITE_META_QUERY: &str = "UPDATE meta SET buddy = $2, rows = $3, days = $4, theme = $5, template = $6, language = $7, show_teacher = $8, show_subject = $9, show_room = $10 WHERE user_id = $1;";

    let res = sqlx::query(WRITE_META_QUERY)
        .bind(user.id)
        .bind(payload.buddy)
        .bind(payload.rows)
        .bind(payload.days)
        .bind(payload.theme)
        .bind(payload.template)
        .bind(payload.language)
        .bind(payload.show_teacher)
        .bind(payload.show_subject)
        .bind(payload.show_room)
        .execute(&db)
        .await;

    return match res {
        Ok(_) => StatusCode::OK.into_response(),
        Err(err) => {
            println!("Err: {}", err);

            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    };
}

pub async fn get_friends(Extension(auth): Extension<AuthState>) -> impl IntoResponse {
    let (user, db) = match resolve_auth_state(auth).await {
        Ok(res) => res,
        Err(status_code) => return status_code.into_response(),
    };

    const FRIENDS_QUERY: &str = "SELECT u.username, u.schedule, f.pending, f.personal_grouping FROM friends f JOIN users u ON f.friend = u.id AND f.pending = false AND f.userr = $1;";

    let friends_data = sqlx::query_as::<_, Friend>(FRIENDS_QUERY)
        .bind(user.id)
        .fetch_all(&db)
        .await;

    let friends: Vec<Friend> = match friends_data {
        Ok(res) => res
            .iter()
            .filter_map(|friend| {
                if !friend.pending {
                    Some(friend.clone())
                } else {
                    None
                }
            })
            .collect(),
        Err(err) => {
            println!("Err: {}", err);

            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    Json(friends).into_response()
}

pub async fn remove_friend(
    Extension(auth): Extension<AuthState>,
    Json(payload): Json<GenericFriendActionPayload>,
) -> impl IntoResponse {
    let (user, db) = match resolve_auth_state(auth).await {
        Ok(res) => res,
        Err(status_code) => return status_code.into_response(),
    };

    let added_friend = match get_user_by_name(payload.friend_name.as_str(), &db).await {
        Ok(user) => user,
        Err(status_code) => return status_code.into_response(),
    };

    const REMOVE_FRIEND_QUERY: &str = "DELETE FROM friends where pending = false and userr = $1 and friend = $2 OR pending = false and userr = $2 and friend = $1;";

    match sqlx::query(REMOVE_FRIEND_QUERY)
        .bind(user.id)
        .bind(added_friend.id)
        .execute(&db)
        .await
    {
        Ok(_) => StatusCode::OK.into_response(),
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    }
}

pub async fn get_friend_requests(Extension(auth): Extension<AuthState>) -> impl IntoResponse {
    let (user, db) = match resolve_auth_state(auth).await {
        Ok(res) => res,
        Err(status_code) => return status_code.into_response(),
    };

    const FRIENDS_QUERY: &str = "SELECT u.username, u.schedule, f.pending, f.personal_grouping FROM friends f JOIN users u ON f.friend = u.id AND f.pending = true AND f.created_by <> $1 AND f.userr = $1;";

    let friends_data = sqlx::query_as::<_, Friend>(FRIENDS_QUERY)
        .bind(user.id)
        .fetch_all(&db)
        .await;

    let friend_requests: Vec<String> = match friends_data {
        Ok(res) => res
            .iter()
            .filter_map(|friend| {
                if friend.pending {
                    Some(friend.clone().username)
                } else {
                    None
                }
            })
            .collect(),
        Err(err) => {
            println!("Err: {}", err);

            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    Json(friend_requests).into_response()
}

pub async fn accept_friend_request(
    Extension(auth): Extension<AuthState>,
    Json(payload): Json<GenericFriendActionPayload>,
) -> impl IntoResponse {
    let (user, db) = match resolve_auth_state(auth).await {
        Ok(res) => res,
        Err(status_code) => return status_code.into_response(),
    };

    let added_friend = match get_user_by_name(payload.friend_name.as_str(), &db).await {
        Ok(user) => user,
        Err(status_code) => return status_code.into_response(),
    };

    const ACCEPT_FRIEND_REQUEST_QUERY: &str = "UPDATE friends SET pending = false where created_by = $2 and userr = $1 and friend = $2 OR created_by = $2 and userr = $2 and friend = $1;";

    match sqlx::query(ACCEPT_FRIEND_REQUEST_QUERY)
        .bind(user.id)
        .bind(added_friend.id)
        .execute(&db)
        .await
    {
        Ok(_) => StatusCode::OK.into_response(),
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    }
}

pub async fn deny_friend_request(
    Extension(auth): Extension<AuthState>,
    Json(payload): Json<GenericFriendActionPayload>,
) -> impl IntoResponse {
    let (user, db) = match resolve_auth_state(auth).await {
        Ok(res) => res,
        Err(status_code) => return status_code.into_response(),
    };

    let added_friend = match get_user_by_name(payload.friend_name.as_str(), &db).await {
        Ok(user) => user,
        Err(status_code) => return status_code.into_response(),
    };

    const REMOVE_FRIEND_REQUEST_QUERY: &str = "DELETE FROM friends where pending = true and userr = $1 and friend = $2 OR pending = true and userr = $2 and friend = $1;";

    match sqlx::query(REMOVE_FRIEND_REQUEST_QUERY)
        .bind(user.id)
        .bind(added_friend.id)
        .execute(&db)
        .await
    {
        Ok(_) => StatusCode::OK.into_response(),
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    }
}

pub async fn open_friend_request(
    Extension(auth): Extension<AuthState>,
    Json(payload): Json<GenericFriendActionPayload>,
) -> impl IntoResponse {
    let (user, db) = match resolve_auth_state(auth).await {
        Ok(res) => res,
        Err(status_code) => return status_code.into_response(),
    };

    let added_friend = match get_user_by_name(payload.friend_name.as_str(), &db).await {
        Ok(user) => user,
        Err(status_code) => return status_code.into_response(),
    };

    const COUNT_QUERY: &str =
        "SELECT COUNT(*) as Rows FROM Friends where userr = $1 and friend = $2;";
    const ADD_FRIEND_REQUEST_QUERY: &str =
        "INSERT INTO friends (userr, friend, created_by) VALUES ($1, $2, $1);";
    const ADD_FRIEND_REQUEST_QUERY_REVERSE: &str =
        "INSERT INTO friends (userr, friend, created_by) VALUES ($2, $1, $1);";

    let count_res: Result<PgRow, Error> = sqlx::query(COUNT_QUERY)
        .bind(user.id)
        .bind(added_friend.id)
        .fetch_one(&db)
        .await;

    let count_row = match count_res {
        Ok(count) => count,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    let count = match count_row.try_get::<i64, _>("rows") {
        Ok(count) => count,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    if count != 0 {
        return StatusCode::BAD_REQUEST.into_response();
    }

    match sqlx::query(ADD_FRIEND_REQUEST_QUERY)
        .bind(user.clone().id)
        .bind(added_friend.clone().id)
        .execute(&db)
        .await
    {
        Ok(_) => {}
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    match sqlx::query(ADD_FRIEND_REQUEST_QUERY_REVERSE)
        .bind(user.id)
        .bind(added_friend.id)
        .execute(&db)
        .await
    {
        Ok(_) => {}
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    StatusCode::OK.into_response()
}

pub async fn add_friend_group(
    Extension(auth): Extension<AuthState>,
    Json(group_request_payload): Json<AddGroupRequestPayload>,
) -> impl IntoResponse {
    let (user, db) = match resolve_auth_state(auth).await {
        Ok(res) => res,
        Err(status_code) => return status_code.into_response(),
    };

    let friend = match get_user_by_name(group_request_payload.friend.as_str(), &db).await {
        Ok(user) => user,
        Err(status_code) => return status_code.into_response(),
    };

    const ADD_GROUP_QUERY: &str = "UPDATE friends SET personal_grouping = $3 WHERE userr = $1 and friend = $2 and pending = false;";

    let res = sqlx::query(ADD_GROUP_QUERY)
        .bind(user.id)
        .bind(friend.id)
        .bind(group_request_payload.personal_grouping)
        .execute(&db)
        .await;

    return match res {
        Ok(_) => StatusCode::OK.into_response(),
        Err(err) => {
            println!("Err: {}", err);

            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    };
}

pub async fn remove_friend_group(
    Extension(auth): Extension<AuthState>,
    Json(payload): Json<GenericFriendActionPayload>,
) -> impl IntoResponse {
    let (user, db) = match resolve_auth_state(auth).await {
        Ok(res) => res,
        Err(status_code) => return status_code.into_response(),
    };

    let friend = match get_user_by_name(payload.friend_name.as_str(), &db).await {
        Ok(user) => user,
        Err(status_code) => return status_code.into_response(),
    };

    const ADD_GROUP_QUERY: &str = "UPDATE friends SET personal_grouping = NULL WHERE userr = $1 and friend = $2 and pending = false;";

    let res = sqlx::query(ADD_GROUP_QUERY)
        .bind(user.id)
        .bind(friend.id)
        .execute(&db)
        .await;

    return match res {
        Ok(_) => StatusCode::OK.into_response(),
        Err(err) => {
            println!("Err: {}", err);

            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    };
}

pub async fn get_user_by_name(username: &str, database: &Database) -> Result<User, StatusCode> {
    const USER_QUERY: &str = "Select id, username from users where username = $1;";

    return match sqlx::query_as::<_, User>(USER_QUERY)
        .bind(username)
        .fetch_one(database)
        .await
    {
        Ok(user) => Ok(user),
        Err(_) => Err(StatusCode::BAD_REQUEST),
    };
}

pub async fn sign_up_user(
    Extension(database): Extension<Database>,
    Extension(random): Extension<Random>,
    Json(user): Json<CreateUser>,
) -> impl IntoResponse {
    if user.username.len() < 3 || user.password.len() < 5 {
        return StatusCode::UNPROCESSABLE_ENTITY.into_response();
    }

    let user_res = create_user(&user.username, &user.password, &database).await;

    let user_id = match user_res {
        Ok(id) => id,
        Err(status_code) => return status_code.into_response(),
    };

    let session_res = new_session(&database, random, user_id).await;

    let session_token = match session_res {
        Ok(token) => token,
        Err(status_code) => return status_code.into_response(),
    };

    let cookie_res = set_cookie(&session_token);

    return match cookie_res {
        Ok(response) => response.into_response(),
        Err(status_code) => status_code.into_response(),
    };
}

pub async fn sign_in_user(
    Extension(database): Extension<Database>,
    Extension(random): Extension<Random>,
    Json(user): Json<CreateUser>,
) -> impl IntoResponse {
    let user_res = validate_user_credentials(&user.username, &user.password, &database).await;

    let user_id = match user_res {
        Ok(id) => id,
        Err(status_code) => return status_code.into_response(),
    };

    let session_res = new_session(&database, random, user_id).await;

    let session_token: String = match session_res {
        Ok(token) => token,
        Err(status_code) => return status_code.into_response(),
    };

    let cookie_res = set_cookie(&session_token);

    return match cookie_res {
        Ok(response) => response.into_response(),
        Err(status_code) => status_code.into_response(),
    };
}

pub fn set_cookie(session_token: &str) -> Result<impl IntoResponse, StatusCode> {
    let res = Response::builder()
        .status(StatusCode::SEE_OTHER)
        .header(
            "Set-Cookie",
            format!(
                "session_token={}; Max-Age=999999; SameSite=None; secure",
                session_token
            ),
        )
        .body(Empty::new());

    return match res {
        Ok(response) => Ok(response),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    };
}

pub async fn new_session(
    database: &Database,
    random: Random,
    user_id: i32,
) -> Result<String, StatusCode> {
    const QUERY: &str = "INSERT INTO sessions (session_token, user_id) VALUES ($1, $2);";

    let mut u128_pool = [0u8; 16];
    random.lock().unwrap().fill_bytes(&mut u128_pool);

    let session_token = u128::from_le_bytes(u128_pool);

    let result = sqlx::query(QUERY)
        .bind(&session_token.to_le_bytes().to_vec())
        .bind(user_id)
        .execute(database)
        .await;

    return match result {
        Ok(_) => Ok(session_token.to_string()),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    };
}

pub async fn create_user(
    username: &str,
    password: &str,
    database: &Database,
) -> Result<i32, StatusCode> {
    let salt = SaltString::generate(&mut OsRng);

    let hashed_password = Pbkdf2
        .hash_password(password.as_bytes(), &salt)
        .unwrap()
        .to_string();

    const INSERT_USER_QUERY: &str =
        "INSERT INTO Users (username, password) VALUES ($1, $2) RETURNING id;";

    let fetch_one = sqlx::query_as(INSERT_USER_QUERY)
        .bind(username)
        .bind(hashed_password)
        .fetch_one(database)
        .await;

    match fetch_one {
        Ok((user_id,)) => {
            let res = attach_metadata_to_user(&user_id, database).await;

            match res {
                Ok(_) => Ok(user_id),
                Err(status_code) => Err(status_code),
            }
        }
        Err(Error::Database(database)) if database.constraint() == Some("users_username_key") => {
            return Err(StatusCode::UNPROCESSABLE_ENTITY);
        }
        Err(_) => {
            return Err(StatusCode::UNPROCESSABLE_ENTITY);
        }
    }
}

pub async fn validate_user_credentials(
    username: &str,
    password: &str,
    database: &Database,
) -> Result<i32, StatusCode> {
    const LOGIN_QUERY: &str = "SELECT id, password FROM users WHERE users.username = $1;";

    let row: Option<(i32, String)> = sqlx::query_as(LOGIN_QUERY)
        .bind(username)
        .fetch_optional(database)
        .await
        .unwrap();

    let (user_id, hashed_password) = if let Some(row) = row {
        row
    } else {
        return Err(StatusCode::UNAUTHORIZED);
    };

    // Verify password against PHC string
    let parsed_hash = PasswordHash::new(&hashed_password).unwrap();

    if let Err(_err) = Pbkdf2.verify_password(password.as_bytes(), &parsed_hash) {
        return Err(StatusCode::UNAUTHORIZED);
    }

    Ok(user_id)
}

pub async fn attach_metadata_to_user(user_id: &i32, database: &Database) -> Result<(), StatusCode> {
    const INSERT_QUERY: &str = "INSERT INTO meta (user_id) VALUES ($1);";

    let res = sqlx::query(INSERT_QUERY)
        .bind(user_id)
        .execute(database)
        .await;

    match res {
        Ok(_) => Ok(()),
        Err(err) => {
            println!("{}", err);

            Err(StatusCode::NOT_IMPLEMENTED)
        }
    }
}
