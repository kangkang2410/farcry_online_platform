# FARCRY ONLINE
    * Authenticate players
    * Load and store players settings
    * Store the frags of game sessions
*****************************************
## Launcher:  A desktop app
    * Allow user to
        ** Login:
            *** Playername and email address as username
            *** Password
            *** Inform player if account've been registered
            *** Inform player if account've been verified
            *** Farcry.exe file path section
            *** Inform player if launcher can't find the farcry.exe
        ** Sign up:
            *** Username: unique
            *** Password:
                at least 1 uppercase letter, 
                at least 1 lowercase letter, 
                at least 1 numeric digit, 
                at least 1 non-word character, but no whitespace, 
                contain minimum of 8 characters and MUST not exceed more than 35 characters
            *** Show/hide password button
            *** Button: auto disabled when the combination of all input don't satisfy the condition
            *** Send an email for player to verify email address
        ** Email Verification: 
            *** Displays a waiting message requesting the user to verify his email address.
            *** Automatically run farcry when user email has been verified
        ** Auto matically load the player's settings saved on server
            *** Updates the systems.cfg and game.cfg files
            *** Save setting from systems.cfg and game.cfg files and upload to server after player quit game
        ** Submit the player's settings to server when the player quits Far Cry
        ** Logout
    
## WatchDog
    * Submits match activities once the game session has ended
    * Parallel process under launcher
    
## Restful API
    * RESTful API of the Far Cry online platform
    * Document the logical data model as ERD    
    * Document your RESTful API either in a static document using a comprehensive structure
