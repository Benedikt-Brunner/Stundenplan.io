pub mod migrations {
    use sqlx::{Error, Executor};
    use std::fs::{DirEntry, read_dir};
    use crate::Database;

    fn get_time_from_migration_file_path(path: &str) -> i64 {
        path.split(".").next().unwrap().split("_").last().unwrap().parse::<i64>().unwrap()
    }
    fn get_sorted_migrations() -> Result<Vec<DirEntry>, Error> {
        let migration_paths = match read_dir("./Migrations") {
            Ok(migration_paths) => migration_paths,
            Err(e) => {
                panic!("Could not read migrations directory: {}", e.to_string());
            }
        };

        let mut migrations: Vec<DirEntry> = migration_paths
            .map(|x| match x {
                Ok(x) => x,
                Err(e) => panic!("Could not read migration file: {}", e.to_string()),
            })
            .collect();
        migrations.sort_by(|a, b| {
            let time_a = get_time_from_migration_file_path(a.file_name().to_str().unwrap());

            let time_b = get_time_from_migration_file_path(b.file_name().to_str().unwrap());

            time_a.cmp(&time_b)
        });

        Ok(migrations)
    }

    pub async fn run_migrations(pool: Database) {
        let migrations = match get_sorted_migrations() {
            Ok(migrations) => migrations,
            Err(_) => {
                panic!("Could not read migrations directory");
            }
        };
        for migration in migrations {
            let contents = match std::fs::read_to_string(migration.path()) {
                Ok(contents) => contents,
                Err(_) => {
                    panic!("Could not read migration file: {}", migration.path().to_str().unwrap());
                }
            };

            let _ = pool.acquire().await.unwrap().execute(contents.as_str())
                .await
                .map_err(shuttle_service::error::CustomError::new);
        }
    }
}