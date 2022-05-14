CREATE TABLE IF NOT EXISTS accesari (
   id serial PRIMARY KEY,
   ip VARCHAR(100) NOT NULL,
   user_id INT NULL REFERENCES utilizatori(id),
   pagina VARCHAR(500) NOT NULL,
   data_accesare TIMESTAMP DEFAULT current_timestamp
);

ALTER TABLE accesari
DROP CONSTRAINT accesari_user_id_fkey,
ADD CONSTRAINT accesari_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES utilizatori(id)
  ON DELETE CASCADE;