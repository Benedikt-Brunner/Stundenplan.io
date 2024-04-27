pub mod static_routes {
    use axum::extract::Path;
    use axum::response::{Html, IntoResponse};
    use http::{header, HeaderValue, Response, StatusCode};
    use http_body_util::Full;
    use include_dir::{Dir, include_dir};
    use regex::Regex;
    static STATIC_TEMPLATE_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/templates/frontend");

    pub async fn frontend_base() -> impl IntoResponse {
        Html(include_str!("../templates/frontend/index.html"))
    }

    pub async fn user_sign_up_view() -> impl IntoResponse {
        Html(include_str!("../templates/userSignUp.html"))
    }

    pub async fn user_sign_in_view() -> impl IntoResponse {
        Html(include_str!("../templates/userSignIn.html"))
    }

    pub async fn sign_out_user_view() -> impl IntoResponse {
        Html(include_str!("../templates/userSignOut.html"))
    }

    pub async fn static_path(Path(path): Path<String>) -> impl IntoResponse {
        let regex = Regex::new(r".?/").unwrap();
        let path = path.trim_start_matches(|c: char| regex.is_match(c.to_string().as_str()));
        let mime_type = mime_guess::from_path(path).first_or_text_plain();

        let file = match STATIC_TEMPLATE_DIR.get_file(path) {
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
}