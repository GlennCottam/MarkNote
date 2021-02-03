# MarkNote: A Markdown Document Writer
MarkNote will be an online web application that will be optimized for both desktop and mobile devices. It will use Markdown (a language originally used for quick web based document writing) so the user will have the ability to take notes quickly, and efficiently. Since MarkNote will be a web application, the user interface will be written in HTML, CSS, and Javascript while using various frameworks to make it not only look good, but perform good.

MarkNote will have the ability to create notes for programmers, mathematicians, and program document writers as it will have frameworks to make code snippets, math symbols, and structures easy to create and add in a document. Since markdown is based off of HTML, CSS, and JavaScript, it is a good possibility other frameworks and tools can be added later down the road to provide additional functionality and usefulness to the end users.

# How it will work
Since it will be a web application, MarkNote will be a application accessable to any device with a browser capable of running JavaScript. This means mobile, tablet, and desktop.

The files themselves will be saved, and accessed on Google Drive to allow users to access the files on their own. Also will allow users to use their current markdown files with the editor.

**Disclaimer**: This application is my final project for computer science. I am limited by the time I have alloted, but I will most likely continue work on it later on as I will most likely use this tool for my own personal use.

# Frameworks
- **Backend Frameworks**:
  - **Node.js**: Backend for all server functions that the user won't see.
  - **Express.js**: Web server that will run in Node.js to host files and process requests.
  - **EJS**: A framework designed to work similar to PHP where the server does the page loading with information it receives rather than giving the information to the client to use. More for security and server processing than anything else.
- **Frontend Frameworks**:
  - **Bootstrap**: A compilable style sheet that is easily implemented in HTML to make websites look very nice (I can also change themes from here).
  - **Fontawsome**: An amazing set of icons for a better user experience.
  - **JQuery**: Framework for making client based javascript easier to write.
  - **Showdown.js**: A powerful markdown to HTML converter.
  - **Highlight.js**: Toolset to convert markdown code snippets to look good.
  - **KaTeX / LaTeX**: Similar to Showdown.js, allows conversion of specific text to math symbols and structures.
- **Other Tools / Platforms / Frameworks**:
  - **Git**: Keep track of changes, and ability to roll back code.
  - **VSCode**: For writing the files for the project (however most of it will be created inside of GCP since that is where it will exist and function).
  - **NPM**: A Package manager for Node.js to allow quick install of frameworks, and other tools.

# Mockups
## File Management System
![File Management Page](assets/readme/MarkNote%20Project%20Data-File%20Management%20Page.png)

Since the file management system will have to be located on the application page, I will need top design one. Here we can see that it will just be a simple listing of files with modification dates / times, additional info, and either a folder or a file, designed by colors and icons.

Double clicking a folder, it will simply open that folder. On a single click of a file, it will open a context menu, allowing the user to see additional file information, specific actions (delete, modify), and a small preview of the markdown file.

For moving a file (in the open context menu), a simple GUI will appear over the rest, showing where to move the file too.

Mobile will look similar, just a more compact view made for vertical devices. If (hopefully) there is some sort of plugin or framework I find that does all that for me (like actually though Google Drive) that is easy to implement, I will change to that.

## Editor Page
![Editor Page](assets/readme/MarkNote%20Project%20Data-Main%20Editor%20Page.png)

The editing page will feature a textbox that will have a preview. The preview with either be a line by line basis (when you hit enter, it will submit, and change that line to markdown), or a preview somewhere on the page.

There will be 2 buttons, one for code, one for math. The math button will bring up the context menu (shown below the main window in the figure) and a user can select from tabbed options what they want to include. This menu will also function the same in mobile. From there, the user can fill in the needed information.

As of right now, I will need to do some further research to define the categories that will be listed on the menu that will work with the LaTeX (or KaTeX) functions better.


# Timeline
- [ ] Design Base UI
- [ ] Create List of Requirements
- [ ] Configure Node.js Webserver
- [ ] Configure Google Cloud Platform
- [ ] Create Functionality to save Markdown Files to Google Drive
- [ ] Create Account Functions for Google
- [ ] Create basic web pages (file management)
- [ ] Test Account Functions
- [ ] Create GUI for math and code functions
- [ ] Implement Frameworks for Math and Code
- [ ] Test Backend
- [ ] Test Frontend
- [ ] (Optional) Redsign UI
- [ ] (Optional) Create live preview method
- [ ] (Optional) Design and implement a Logo
- [ ] Open To Public Access