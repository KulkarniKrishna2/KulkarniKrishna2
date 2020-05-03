# Finflux - Banking Made Easy

## Finflux- Web

This is the web application and it is a Single-Page App (SPA) written in web standard technologies like JavaScript, CSS and HTML5. It leverages common popular frameworks/libraries such as AngularJS, Bootstrap and Font Awesome.

### Prerequisite for Finflux-Web :
* Ensure you have ```npm``` installed - goto http://nodejs.org/download/ to download installer for your OS.       
<br/> Note: On Ubuntu Linux you can use 'sudo apt-get install npm nodejs-legacy' (nodejs-legacy is required to avoid the ""/usr/bin/env: node: No such file or directory" problem). 
<br/> Tip: If you are using Ubuntu/Linux, then doing ```npm config set prefix ~``` prevents you from having to run npm as root.

### How to build : 
* To download the dependencies, and be able to build, first install bower & grunt
   ```
    npm install -g bower
    npm install -g grunt-cli
   ```
* Next pull the runtime and build time dependencies by running bower and npm install commands on the project root folder

   ```
    bower install
    npm install 
   ```

* To preview the app, run the following command on the project root folder

   ```
    grunt serve
   ```

* Build the code for production deployment.

  ```
   grunt prod
  ```
### Deploy using Docker :
* To read detailed documentation [click-here](docker-readme.md)  