# INSTALLATION (For development only):
## STEP 0: Download our project on gitLab
##### &nbsp; &nbsp; &nbsp; - Without GIT: 
	        Connect to our gitLab repository, go to branch master, click on 'Downloads' button. 
	        Unzip downloaded folder

##### &nbsp; &nbsp; &nbsp; - With GIT: 
            Run this command on Terminal: git clone http://gitlab.intek.edu.vn/FarCryOnlinePlatform/batch_2_khang_vu_luan

## STEP 1: Deploy server on Windows 10/ Linux Ubuntu/ macOS Sierra
		
###### &nbsp; &nbsp; &nbsp; - STEP 1.1: Pre-requirement (Please use the lastest version of following frameworks/ libs/ tools):  
			+ Python 3.7 and pip (remember to add python to PATH while installing)
			+ Open /PathToOurRepository/batch_2_khang_vu_luan/farcryServer/requirements.txt, install all libs/ framework/ tools listed in that file.
			
###### &nbsp; &nbsp; &nbsp; - STEP 1.2: Open Terminal

###### &nbsp; &nbsp; &nbsp; - STEP 1.3:  Move to folder 'farcryServer' inside our repository using command 'cd'
            cd /PathToOurRepository/batch_2_khang_vu_luan/farcryServer/

###### &nbsp; &nbsp; &nbsp; - STEP 1.4: Run command below (Important note: You need to make sure there is no other running local server)
		    Windows: python manage.py runserver
		    MacOs/ Linux: python3 manage.py runserver

###### &nbsp; &nbsp; &nbsp; - STEP 1.5: Connect to local site
		    + Open this url: http://127.0.0.1:8000/admin
		    + Login with username / password: guest / guest

###### &nbsp; &nbsp; &nbsp; - STEP 1.6 (Optional):  Test our API by using our API Doc (SWAGGER) and 3rd party API testing tool (POSTMAN)
            IMPORTANT: Our API Doc was created for the final product version, so in order to make things work, you MUST change 'https://farcryserver.herokuapp.com/' to 'http://127.0.0.1:8000/' when calling the API.


## STEP 2: Run Launcher
##### &nbsp; Launcher will automatically run the Watchdog, however you can always run the stand-alone Watchdog, see in STEP 3
##### &nbsp; NOTE: If Launcher doesn't open, make sure there is no other instance is running. Open Task Manager and force quit any other process named FarCryOnlineLauncher.exe.
##### &nbsp; Incompleted matches will be considered invalid. Invalid matches will not be pushed to server.

##### &nbsp; &nbsp; &nbsp; EASY-WAY (Highly recommendation) (Windows only):
		    + Go to /PathToOurRepository/batch_2_khang_vu_luan/launcher(In_Development)/batch_2_khang_vu_luan/
		    + run FarCryOnlineLauncher.exe as Administrator
		
##### &nbsp; &nbsp; &nbsp; HARD-WAY (Not recommendation) on Windows 10/ Linux Ubuntu/ macOS Sierra (Note: Linux and MacOS version might not work as expected)

##### &nbsp; &nbsp; &nbsp; - STEP 2.1: Pre-requirement (Please use the lastest version of following frameworks/ libs/ tools)
		    + NodeJS and npm
		    + Electron framework
		    + Klaw-sync - NodeJS library

##### &nbsp; &nbsp; &nbsp; - STEP 2.2: Open a second Terminal

##### &nbsp; &nbsp; &nbsp; - STEP 2.3: Move to folder 'launcher' inside our repository using command 'cd'
	        cd /PathToOurRepository/batch_2_khang_vu_luan/launcher

##### &nbsp; &nbsp; &nbsp; - STEP 2.4: Run command below:
            npm start


## STEP 3 (Optional): Run stand-alone Watchdog on Windows 10/ Linux Ubuntu/ macOS Sierra
		
##### &nbsp; &nbsp; &nbsp; - STEP 3.1: Open terminal and use the command below to install packages
            pip install requests
            pip install psutil
            
##### &nbsp; &nbsp; &nbsp; - STEP 3.2:  Move to folder 'launcher' inside our repository
		    cd /PathToOurRepository/batch_2_khang_vu_luan/launcher
            
##### &nbsp; &nbsp; &nbsp; - STEP 3.3: Run command below
		    farcry_watchdog  [absolute_path_to_file_log.txt]  [valid_user_login_token]  [valid_username]  [process_game_name_ie_FarCry.exe]
			    + [absolute_path_to_file_log.txt] - example: C\Bin\FarCry\log.txt
			    + [valid_user_login_token] - example: get from admin site, row Login_Token, column token
			    + [valid_username] - example: get from admin site, row Login_Token, column player_name
			    + [process_game_name_ie_FarCry.exe] - example: FarCry.exe