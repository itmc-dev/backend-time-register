-- Create users table
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL
);

-- Create timesheet table
CREATE TABLE timesheet (
  timesheet_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES "user"(id),
  task VARCHAR(255),
  project VARCHAR(255),
  hours_worked NUMERIC,
  description TEXT,
  status VARCHAR(50)
);
