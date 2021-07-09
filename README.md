# p2b-logger
A basic logger for logging to the console, files and mongodb.

following environment variables need to be defined inside the .env file:  
LOGGER_LEVEL=debug   
DIRECTORY_LOGFILES=./    

If LOGGING_TO_DB_ENABLED is true, all environment variables below must also be provided.
LOGGING_TO_DB_ENABLED=true  
MONGO_DB_USER=  
MONGO_DB_PW=  
MONGO_DB_URL=  
MONGO_DB_REPLICA_SET=  
LOGGING_ERROR_DB=  
LOGGING_ERROR_COLLECTION=  
