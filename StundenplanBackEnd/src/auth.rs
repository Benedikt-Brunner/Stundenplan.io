use crate::Database;
use axum::body::Body;
use axum::response::IntoResponse;
use http::Request;
use http::{Response, StatusCode};
use http_body_util::Empty;
use serde::Serialize;
use sqlx::FromRow;

#[derive(Serialize, FromRow, Clone, Debug)]
pub struct User {
    pub(crate) id: i32,
    username: String,
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

pub async fn auth(
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

pub async fn resolve_auth_state(mut auth: AuthState) -> Result<(User, Database), StatusCode> {
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

    Ok((user, db))
}

pub async fn sign_out_user() -> impl IntoResponse {
    Response::builder()
        .status(StatusCode::SEE_OTHER)
        .header("Set-Cookie", "session_token=_; Max-Age=0")
        .body(Empty::new())
        .unwrap()
}
