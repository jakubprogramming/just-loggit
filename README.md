# p2b-logger
A basic logger for logging to the console, files and mongodb.

following environment variables need to be defined inside the .env file:  
LOGGER_LEVEL=debug   
DIRECTORY_LOGFILES=./    

If LOGGING_TO_DB_ENABLED is true, all environment variables below must also be provided.
LOGGING_TO_DB_ENABLED=true
LOGGING_MONGO_DB_USER=
LOGGING_MONGO_DB_PW=
LOGGING_MONGO_DB_URL=
LOGGING_MONGO_DB_REPLICA_SET=
LOGGING_MONGO_ERROR_DB=
LOGGING_MONGO_ERROR_COLLECTION=
