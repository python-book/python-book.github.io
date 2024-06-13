## Main Features

### multi tab code editor support with python syntax highlighter
The page support multi tab code editor, when you save a file (or import a file from the book's stock examples), the tab name is changed to the filename. 
you can switch between tabs, only the current tab is visible, and code in it can execute. Other tabs will retain their code, once you switch to them, you can execute. 


### Handling Files
You can save files both using python open(filename, "w"), and the "Save VMFile" button. 
Your Python code can only interact with the VM's file system, so you open/read/write are against the VM. 

#### You can download all working files to a zip
The download VM files to local (as ZIP) packs all files under /workdir in the VM as a zip file and asks the user to select where to save the zip. 
The upload local files to VM can handle either a single regular file, which will be simply uploaded, or a zip, which will be unpacked upon upload. 

## Dependencies
### CodeMirror
This is the code editer. It can be downloaded via https://github.com/codemirror/codemirror5 (use the get the ZIP file option to avoid downloading stuff from the internet during runtime)

### Pyodide
This is the Python run time. NOTE: pyodide needs a webserver, it does not work locally from file://
Download it from: https://github.com/pyodide/pyodide/releases, extract it to pyodide dir (the default)

### JSZip
Used to download all files from VM as ZIP to local harddrive.
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
The Download VM files to local (As ZIP) will download everything under /workdir in the VM as a zip file and ask the user to select where to save the zip. 

