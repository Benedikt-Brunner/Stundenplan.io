Create Table IF NOT EXISTS Users(
id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
username text NOT NULL UNIQUE,
password text NOT NULL,
schedule jsonb DEFAULT '[ { "Hours": "08:00 - 09:40", "Day1": { "Subject": "", "Teacher": "", "Room": "" }, "Day2": { "Subject": "", "Teacher": "", "Room": "" }, "Day3": { "Subject": "", "Teacher": "", "Room": "" }, "Day4": { "Subject": "", "Teacher": "", "Room": "" }, "Day5": { "Subject": "", "Teacher": "", "Room": "" } }, { "Hours": "09:50 - 11:30", "Day1": { "Subject": "", "Teacher": "", "Room": "" }, "Day2": { "Subject": "", "Teacher": "", "Room": "" }, "Day3": { "Subject": "", "Teacher": "", "Room": "" }, "Day4": { "Subject": "", "Teacher": "", "Room": "" }, "Day5": { "Subject": "", "Teacher": "", "Room": "" } }, { "Hours": "11:40 - 13:20", "Day1": { "Subject": "", "Teacher": "", "Room": "" }, "Day2": { "Subject": "", "Teacher": "", "Room": "" }, "Day3": { "Subject": "", "Teacher": "", "Room": "" }, "Day4": { "Subject": "", "Teacher": "", "Room": "" }, "Day5": { "Subject": "", "Teacher": "", "Room": "" } }, { "Hours": "13:30 - 15:10", "Day1": { "Subject": "", "Teacher": "", "Room": "" }, "Day2": { "Subject": "", "Teacher": "", "Room": "" }, "Day3": { "Subject": "", "Teacher": "", "Room": "" }, "Day4": { "Subject": "", "Teacher": "", "Room": "" }, "Day5": { "Subject": "", "Teacher": "", "Room": "" } }, { "Hours": "15:20 - 17:00", "Day1": { "Subject": "", "Teacher": "", "Room": "" }, "Day2": { "Subject": "", "Teacher": "", "Room": "" }, "Day3": { "Subject": "", "Teacher": "", "Room": "" }, "Day4": { "Subject": "", "Teacher": "", "Room": "" }, "Day5": { "Subject": "", "Teacher": "", "Room": "" } }, { "Hours": "17:10 - 18:50", "Day1": { "Subject": "", "Teacher": "", "Room": "" }, "Day2": { "Subject": "", "Teacher": "", "Room": "" }, "Day3": { "Subject": "", "Teacher": "", "Room": "" }, "Day4": { "Subject": "", "Teacher": "", "Room": "" }, "Day5": { "Subject": "", "Teacher": "", "Room": "" } }, { "Hours": "19:00 - 20:40", "Day1": { "Subject": "", "Teacher": "", "Room": "" }, "Day2": { "Subject": "", "Teacher": "", "Room": "" }, "Day3": { "Subject": "", "Teacher": "", "Room": "" }, "Day4": { "Subject": "", "Teacher": "", "Room": "" }, "Day5": { "Subject": "", "Teacher": "", "Room": "" } } ]'
);

Create Table IF NOT EXISTS Friends(
userr INTEGER REFERENCES Users(id) ON DELETE CASCADE,
friend INTEGER REFERENCES Users(id) ON DELETE CASCADE,
pending BOOL DEFAULT TRUE,
created_by INTEGER REFERENCES Users(id) ON DELETE CASCADE,
personal_grouping text DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS Meta (
  user_id integer NOT NULL,
  buddy varchar DEFAULT '👾',
  rows int DEFAULT 7,
  days boolean DEFAULT false,
  theme varchar DEFAULT 'Light',
  template varchar DEFAULT 'University',
  language varchar DEFAULT 'de',
  CONSTRAINT meta_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
    session_token BYTEA PRIMARY KEY,
    user_id integer REFERENCES users (id) ON DELETE CASCADE
);