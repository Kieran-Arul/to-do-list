## Project Overview

- This website connects to a local MongoDB database, allowing you to publish and save your to-do items
- Note that to use this website, you need MongoDB installed on your local machine
- If you do not have MongoDB installed, go to https://docs.mongodb.com/manual/administration/install-community/ and follow the installation instructions

## How to Use

1\. Clone the repository to your local machine
	
	git clone https://github.com/Kieran-Arul/to-do-list

2\. cd into the project directory

	cd to-do-list

3\. Run the following command to install the necessary dependencies

	npm install
  
4\. Start your local MongoDB server by running:

	mongod
  
5\. Run the following command to start a server on Port 3000:

  	npm start
  
6\. Open up your internet browser and go to http://localhost:3000/
  
7\. You should now be able to browse the website

8\. If you want to create a new to-do-list for a separate category of items such as shopping for example, put your choice of category name into the URL like so: http://localhost:3000/shopping
