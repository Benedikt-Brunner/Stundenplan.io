mod auth;
mod static_routes;
mod api_routes;
mod migrations;

use axum::{
    routing::{get, post},
    Extension, Router,
};
use password_hash::{
    rand_core::{OsRng, RngCore}
};
use rand_chacha::ChaCha20Rng;
use rand_core::SeedableRng;
use std::sync::{Arc, Mutex};
use crate::api_routes::api_routes::*;
use crate::auth::auth::*;
use crate::static_routes::static_routes::*;
use crate::migrations::migrations::*;

type Database = sqlx::PgPool;
type Random = Arc<Mutex<ChaCha20Rng>>;

#[shuttle_runtime::main]
async fn main(
    #[shuttle_shared_db::Postgres(
    local_uri = "postgres://postgres:{secrets.PASSWORD}@localhost:{secrets.PORT}/postgres"
)] pool: Database,
) -> shuttle_axum::ShuttleAxum {
    run_migrations(pool.clone()).await;

    let middleware_database = pool.clone();

    let random = ChaCha20Rng::seed_from_u64(OsRng.next_u64());

    let router = Router::new()
        .route("/", get(frontend_base))
        .route("/api/userSignUp", get(user_sign_up_view).post(sign_up_user))
        .route("/api/userSignIn", get(user_sign_in_view).post(sign_in_user))
        .route("/api/userSignOut", get(sign_out_user_view).post(sign_out_user))
        .route("/api/userInfo", get(get_user_data))
        .route("/api/userSchedule", get(get_schedule))
        .route("/api/userMetadata", get(get_metadata))
        .route("/api/userFriends", get(get_friends))
        .route("/api/userFriendRequests", get(get_friend_requests))
        .route("/api/setUserMetadata", post(persist_metadata))
        .route("/api/setUserSchedule", post(persist_schedule))
        .route("/api/openFriendRequest", post(open_friend_request))
        .route("/api/denyFriendRequest", post(deny_friend_request))
        .route("/api/acceptFriendRequest", post(accept_friend_request))
        .route("/api/removeFriend", post(remove_friend))
        .route("/api/addGroup", post(add_friend_group))
        .route("/api/removeGroup", post(remove_friend_group))
        .route("/api/styles", post(styles))
        .route("/*path", get(static_path))
        .layer(axum::middleware::from_fn(move |req, next| {
            auth(req, next, middleware_database.clone())
        }))
        .layer(Extension(pool))
        .layer(Extension(Arc::new(Mutex::new(random))));

    Ok(router.into())
}
