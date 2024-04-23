use axum::extract::Path;
use axum::{
    body::Body,
    extract::Json,
    http::{HeaderValue, Request, Response, StatusCode},
    response::{Html, IntoResponse},
    routing::{get, post},
    Extension, Router,
};
use http::header;
use http_body_util::{Empty, Full};
use include_dir::{include_dir, Dir};
use password_hash::{
    rand_core::{OsRng, RngCore},
    PasswordHash, PasswordHasher, PasswordVerifier, SaltString,
};
use pbkdf2::Pbkdf2;
use rand_chacha::ChaCha20Rng;
use rand_core::SeedableRng;
use regex::Regex;
use serde::{Deserialize, Serialize};
use sqlx::postgres::PgRow;
use sqlx::types::JsonValue;
use sqlx::{Error, Executor, FromRow, Row};
use std::sync::{Arc, Mutex};

type Database = sqlx::PgPool;
type Random = Arc<Mutex<ChaCha20Rng>>;

static STATIC_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/templates/frontend");

#[derive(Deserialize, Clone)]
struct CreateUser {
    username: String,
    password: String,
}

#[derive(Serialize, FromRow, Clone, Debug)]
struct User {
    id: i32,
    username: String,
}

#[derive(Debug, Deserialize, Serialize, FromRow, Clone)]
struct UserData {
    username: String,
    schedule: UserSchedule,
    meta: UserMetadata,
    friends: Vec<String>,
    friend_requests: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize, FromRow, Clone)]
struct UserMetadata {
    buddy: String,
    rows: i32,
    days: bool,
    theme: String,
    template: String,
    language: String,
}

#[derive(Deserialize, Serialize, Debug, FromRow, Clone)]
struct UserSchedule {
    schedule: JsonValue,
}

#[derive(Debug, Serialize, FromRow, Clone)]
struct Friend {
    username: String,
    schedule: JsonValue,
    pending: bool,
    personal_grouping: Option<String>,
}

#[derive(Debug, FromRow, Clone)]
struct UsernameWrapper {
    username: String,
}

#[derive(Deserialize, Serialize, Debug)]
struct AddGroupRequestPayload {
    friend: String,
    personal_grouping: String,
}

#[derive(Deserialize, Serialize, Debug)]
struct GenericFriendActionPayload {
    friend_name: String,
}

#[derive(Clone)]
pub(crate) struct AuthState(Option<(u128, Option<User>, Database)>);

impl AuthState {
    pub async fn get_user(&mut self) -> Option<&User> {
        let (session_token, store, database) = self.0.as_mut()?;

        if store.is_none() {
            const QUERY: &str =
                "SELECT id, username FROM users JOIN sessions ON user_id = id WHERE session_token = $1;";

            let user: Option<(i32, String)> = sqlx::query_as(QUERY)
                .bind(&session_token.to_le_bytes().to_vec())
                .fetch_optional(&*database)
                .await
                .unwrap();

            if let Some((id, username)) = user {
                *store = Some(User { id, username });
            }
        }
        store.as_ref()
    }
}

async fn auth(
    mut req: Request<Body>,
    next: axum::middleware::Next,
    database: Database,
) -> axum::response::Response {
    let session_token = req
        .headers()
        .get_all("Cookie")
        .iter()
        .filter_map(|cookie| {
            cookie
                .to_str()
                .ok()
                .and_then(|cookie| cookie.parse::<cookie::Cookie>().ok())
        })
        .find_map(|cookie| {
            (cookie.name() == "session_token").then(move || cookie.value().to_owned())
        })
        .and_then(|cookie_value| cookie_value.parse::<u128>().ok());

    req.extensions_mut()
        .insert(AuthState(session_token.map(|v| (v, None, database))));

    next.run(req).await
}

async fn frontend_base() -> impl IntoResponse {
    Html(include_str!("../templates/frontend/index.html"))
}

async fn resolve_auth_state(mut auth: AuthState) -> Result<(User, Database), StatusCode> {
    let (_, check_user, db) = match &auth.0 {
        None => return Err(StatusCode::UNAUTHORIZED),
        Some(state) => state.to_owned(),
    };

    let user = match check_user {
        None => match auth.get_user().await {
            None => return Err(StatusCode::UNAUTHORIZED),
            Some(user) => user.to_owned(),
        },
        Some(user) => user,
    };
    return Ok((user, db));
}

async fn get_user_data(Extension(auth): Extension<AuthState>) -> impl IntoResponse {
    let (user, db) = match resolve_auth_state(auth).await {
        Ok(res) => res,
        Err(status_code) => return status_code.into_response(),
    };

    const USERNAME_QUERY: &str = "SELECT username from users where id = $1;";
    const SCHEDULE_QUERY: &str = "SELECT schedule FROM users Where id = $1;";
    const META_QUERY: &str = "SELECT buddy, rows, days,theme, template, language FROM meta Join users ON user_id = id Where id = $1;";
    const FRIENDS_QUERY: &str = "SELECT u.username, u.schedule, f.pending, f.personal_grouping FROM friends f JOIN users u ON f.friend = u.id AND f.created_by <> $1 AND f.userr = $1;";

    let username_data = sqlx::query_as::<_, UsernameWrapper>(USERNAME_QUERY)
        .bind(user.id)
        .fetch_one(&db)
        .await;

    let username = match username_data {
        Ok(res) => res.username,
        Err(err) => {
            println!("Err: {}", err.to_string());

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
            println!("Err: {}", err.to_string());

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
            println!("Err: {}", err.to_string());

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
            println!("Err: {}", err.to_string());

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

async fn get_schedule(Extension(auth): Extension<AuthState>) -> impl IntoResponse {
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
            println!("Err: {}", err.to_string());

            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    Json(schedule).into_response()
}

async fn persist_schedule(
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
            println!("Err: {}", err.to_string());

            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    };
}

async fn get_metadata(Extension(auth): Extension<AuthState>) -> impl IntoResponse {
    let (user, db) = match resolve_auth_state(auth).await {
        Ok(res) => res,
        Err(status_code) => return status_code.into_response(),
    };

    const META_QUERY: &str = "SELECT buddy, rows, days, theme, template, language FROM meta Join users ON user_id = id Where id = $1;";

    let meta_data = sqlx::query_as::<_, UserMetadata>(META_QUERY)
        .bind(user.id)
        .fetch_one(&db)
        .await;

    let meta = match meta_data {
        Ok(res) => res,
        Err(err) => {
            println!("Err: {}", err.to_string());

            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    Json(meta).into_response()
}

async fn persist_metadata(
    Extension(auth): Extension<AuthState>,
    Json(payload): Json<UserMetadata>,
) -> impl IntoResponse {
    let (user, db) = match resolve_auth_state(auth).await {
        Ok(res) => res,
        Err(status_code) => return status_code.into_response(),
    };

    const WRITE_META_QUERY: &str = "UPDATE meta SET buddy = $2, rows = $3, days = $4, theme = $5, template = $6, language = $7 WHERE user_id = $1;";

    let res = sqlx::query(WRITE_META_QUERY)
        .bind(user.id)
        .bind(payload.buddy)
        .bind(payload.rows)
        .bind(payload.days)
        .bind(payload.theme)
        .bind(payload.template)
        .bind(payload.language)
        .execute(&db)
        .await;

    return match res {
        Ok(_) => StatusCode::OK.into_response(),
        Err(err) => {
            println!("Err: {}", err.to_string());

            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    };
}

async fn get_friends(Extension(auth): Extension<AuthState>) -> impl IntoResponse {
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
            println!("Err: {}", err.to_string());

            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    Json(friends).into_response()
}

async fn remove_friend(
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

async fn get_friend_requests(Extension(auth): Extension<AuthState>) -> impl IntoResponse {
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
            println!("Err: {}", err.to_string());

            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    Json(friend_requests).into_response()
}

async fn accept_friend_request(
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

async fn deny_friend_request(
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

async fn open_friend_request(
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

async fn add_friend_group(
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
            println!("Err: {}", err.to_string());

            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    };
}

async fn remove_friend_group(
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
            println!("Err: {}", err.to_string());

            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    };
}

async fn get_user_by_name(username: &str, database: &Database) -> Result<User, StatusCode> {
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

async fn user_sign_up_view() -> impl IntoResponse {
    Html(include_str!("../templates/userSignUp.html"))
}

async fn user_sign_in_view() -> impl IntoResponse {
    Html(include_str!("../templates/userSignIn.html"))
}

async fn sign_up_user(
    Extension(database): Extension<Database>,
    Extension(random): Extension<Random>,
    Json(user): Json<CreateUser>,
) -> impl IntoResponse {
    if user.username.len() < 3 || user.password.len() < 5 {
        return StatusCode::UNPROCESSABLE_ENTITY.into_response();
    }

    let user_res = create_user(&user.username, &user.password, &database).await;

    let user_id: i32;

    match user_res {
        Ok(id) => user_id = id,
        Err(status_code) => return status_code.into_response(),
    }

    let session_token: String;

    let session_res = new_session(&database, random, user_id).await;

    match session_res {
        Ok(token) => session_token = token,
        Err(status_code) => return status_code.into_response(),
    }

    let cookie_res = set_cookie(&session_token);

    return match cookie_res {
        Ok(response) => response.into_response(),
        Err(status_code) => status_code.into_response(),
    };
}

async fn sign_in_user(
    Extension(database): Extension<Database>,
    Extension(random): Extension<Random>,
    Json(user): Json<CreateUser>,
) -> impl IntoResponse {
    let user_res = validate_user_credentials(&user.username, &user.password, &database).await;

    let user_id: i32;

    match user_res {
        Ok(id) => user_id = id,
        Err(status_code) => return status_code.into_response(),
    }

    let session_token: String;

    let session_res = new_session(&database, random, user_id).await;

    match session_res {
        Ok(token) => session_token = token,
        Err(status_code) => return status_code.into_response(),
    }

    let cookie_res = set_cookie(&session_token);

    return match cookie_res {
        Ok(response) => response.into_response(),
        Err(status_code) => status_code.into_response(),
    };
}

async fn sign_out_user() -> impl IntoResponse {
    Response::builder()
        .status(StatusCode::SEE_OTHER)
        .header("Set-Cookie", "session_token=_; Max-Age=0")
        .body(Empty::new())
        .unwrap()
}

async fn sign_out_user_view() -> impl IntoResponse {
    Html(include_str!("../templates/userSignOut.html"))
}

fn set_cookie(session_token: &str) -> Result<impl IntoResponse, StatusCode> {
    let res = Response::builder()
        .status(StatusCode::SEE_OTHER)
        .header(
            "Set-Cookie",
            format!(
                "session_token={}; Max-Age=999999; SameSite=None; secure",
                session_token
            ),
        )
        .body(http_body_util::Empty::new());

    return match res {
        Ok(response) => Ok(response),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    };
}

async fn new_session(
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

async fn create_user(
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
            let res = attach_metadata_to_user(&user_id, &database).await;

            match res {
                Ok(_) => Ok(user_id),
                Err(status_code) => Err(status_code),
            }
        }
        Err(sqlx::Error::Database(database))
            if database.constraint() == Some("users_username_key") =>
        {
            return Err(StatusCode::UNPROCESSABLE_ENTITY);
        }
        Err(_) => {
            return Err(StatusCode::UNPROCESSABLE_ENTITY);
        }
    }
}

async fn validate_user_credentials(
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

async fn attach_metadata_to_user(user_id: &i32, database: &Database) -> Result<i32, StatusCode> {
    const INSERT_QUERY: &str = "INSERT INTO meta (user_id) VALUES ($1);";

    let res = sqlx::query(INSERT_QUERY)
        .bind(user_id)
        .execute(database)
        .await;

    match res {
        Ok(_) => Ok(42),
        Err(err) => {
            println!("{}", err.to_string());

            Err(StatusCode::NOT_IMPLEMENTED)
        }
    }
}

async fn static_path(Path(path): Path<String>) -> impl IntoResponse {
    let regex = Regex::new(r".?/").unwrap();
    let path = path.trim_start_matches(|c: char| regex.is_match(c.to_string().as_str()));
    let mime_type = mime_guess::from_path(path).first_or_text_plain();

    let file = match STATIC_DIR.get_file(path) {
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
            HeaderValue::from_str(mime_type.as_ref()).unwrap(),
        )
        .body(Full::from(file.contents()))
        .unwrap()
}

#[shuttle_runtime::main]
async fn main(
    #[shuttle_shared_db::Postgres(
    local_uri = "postgres://postgres:{secrets.PASSWORD}@localhost:3006/postgres"
)] pool: Database,
) -> shuttle_axum::ShuttleAxum {
    pool.execute(include_str!("../schema.sql"))
        .await
        .map_err(shuttle_service::error::CustomError::new)?;

    let middleware_database = pool.clone();

    let random = ChaCha20Rng::seed_from_u64(OsRng.next_u64());

    let router = Router::new()
        .route("/", get(frontend_base))
        .route("/userSignUp", get(user_sign_up_view).post(sign_up_user))
        .route("/userSignIn", get(user_sign_in_view).post(sign_in_user))
        .route("/userSignOut", get(sign_out_user_view).post(sign_out_user))
        .route("/userInfo", get(get_user_data))
        .route("/userSchedule", get(get_schedule))
        .route("/userMetadata", get(get_metadata))
        .route("/userFriends", get(get_friends))
        .route("/userFriendRequests", get(get_friend_requests))
        .route("/setUserMetadata", post(persist_metadata))
        .route("/setUserSchedule", post(persist_schedule))
        .route("/openFriendRequest", post(open_friend_request))
        .route("/denyFriendRequest", post(deny_friend_request))
        .route("/acceptFriendRequest", post(accept_friend_request))
        .route("/removeFriend", post(remove_friend))
        .route("/addGroup", post(add_friend_group))
        .route("/removeGroup", post(remove_friend_group))
        .route("/frontend/*path", get(static_path))
        .layer(axum::middleware::from_fn(move |req, next| {
            auth(req, next, middleware_database.clone())
        }))
        .layer(Extension(pool))
        .layer(Extension(Arc::new(Mutex::new(random))));

    Ok(router.into())
}
