CREATE DATABASE IF NOT EXISTS school_website;
USE school_website;

CREATE TABLE IF NOT EXISTS admission_enquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  city VARCHAR(100) NOT NULL,
  grade VARCHAR(40) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE boards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  url VARCHAR(500) NOT NULL,
  board_id INT NOT NULL,
  city_id INT NOT NULL,
  UNIQUE (board_id, city_id, slug),
  FOREIGN KEY (board_id) REFERENCES boards(id),
  FOREIGN KEY (city_id) REFERENCES cities(id)
);

INSERT INTO boards (name, slug) VALUES
  ('CBSE','cbse'), ('ICSE','icse'), ('State Board','state-board');

INSERT INTO cities (name, slug) VALUES
  ('Hyderabad','hyderabad'), ('Bangalore','bangalore'), ('Chennai','chennai');

INSERT INTO schools (name, slug, url, board_id, city_id) VALUES
 ('Delhi Public School','delhi-public-school','https://www.dpshyderabad.in/',
   (SELECT id FROM boards WHERE slug='cbse'), (SELECT id FROM cities WHERE slug='hyderabad')),
 ('Oakridge International School','oakridge-international-school','https://www.oakridge.in/',
   (SELECT id FROM boards WHERE slug='cbse'), (SELECT id FROM cities WHERE slug='hyderabad'));