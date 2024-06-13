// Function to upload a file to the virtual filesystem/workdir
async function saveFile(filename, fileContent) {
    /**
     * save fileContent to filename into the temp virtualFS of pyodide.
     */
    let pyodide = await pyodideReadyPromise;
    // Write the file content to the current dir
    await pyodide.FS.writeFile(`${filename}`, fileContent);
    stdout_func(`File ${filename} saved successfully.`);
    // Synchronize from in-memory FS to IndexedDB
    await new Promise((resolve, reject) => {
    pyodide.FS.syncfs(false, (err) => {
        if (err) reject(err);
        else resolve();
    });
    });
}

async function readFile(filename) {
    /**
     * read fileContent from filename into the temp virtualFS of pyodide.
     */
    let pyodide = await pyodideReadyPromise
    try {
        const info = pyodide.FS.analyzePath(filename);
        if (info.exists === false || info.error !== 0 ) {
            stderr_func("File not found:", filename);
            throw new Error(`File not found ${filename}`);
        } else if (info.object.isFolder) {
            stderr_func(`Cannot open directory ${filename} as text.`);
            throw new Error(`Cannot read directory ${filename} as text.`);
        } else {
            const fileContent = await pyodide.FS.readFile(`${info.path}`,{encoding:'utf8'});
            return fileContent;
        }
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
}
// Function to open the file selector
async function uploadFileSelector() {
    /**
     * show local file picker and upload to pyodide if a file is selected.
     */
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '*'; // Accept all file types
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const fileContent = e.target.result;
            const filename = file.name;
            if (file.type && file.type === 'application/zip'){
                let zipBinary = fileContent;
                let pyodide = await pyodideReadyPromise;
                pyodide.unpackArchive(zipBinary, "zip");
                stdout_func("File ${filename} uploaded & unpacked successfully.");
                // Synchronize from in-memory FS to IndexedDB
                await new Promise((resolve, reject) => {
                    pyodide.FS.syncfs(false, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
        
            } else {
                const uint8Array = new Uint8Array(fileContent);
                // Write the file content to the current dir
                await saveFile(`${filename}`, uint8Array);
            }
        };
        reader.readAsArrayBuffer(file);
        }
    });
    fileInput.click();
}


async function showFSContents(path = '.', mode="open") {
    /**
     * show a pop up div list virtualFS content, if user picks one, load it into editor
     */
    let pyodide = await pyodideReadyPromise;
    try {
      const contents = await pyodide.FS.readdir(path);
      const fileList = document.getElementById('gitRepofileList');
      fileList.innerHTML = ''; // Clear existing list

      contents.forEach(item => {
        if (item.startsWith('.') && item !== '..')
        {
        } else {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.textContent = item;
            link.href = '#';
            const itemPath = `${path}/${item}`.split('/').filter(Boolean).join('/');
            const info = pyodide.FS.lookupPath(itemPath);
            const isDir = pyodide.FS.isDir(info.node.mode);
            if (isDir) {
                link.textContent += "/";
            }
            if (isDir) {
                link.onclick = (event) => {
                    event.preventDefault();
                    showFSContents(itemPath, mode);
                }
            } else {
                if (mode === "open") {
                    link.onclick = (event) =>{
                        closePopup();
                        console.log(`File selected: ${itemPath}`);
                        const fileContent = pyodide.FS.readFile(itemPath,{encoding:'utf8'});
                        window.editor.setValue(fileContent);
                        const tabId = window.editor.getWrapperElement().parentElement.dataset.tabId;
                        targetTab = document.querySelector(`.tab[data-tab-id="${tabId}"]`)
                        targetButton = targetTab.querySelector(`.tab-button`);
                        targetButton.textContent = item;
                        window.editor.focus();
                    }
                } else if (mode === "save") {
                    link.onclick = (event) => {
                        event.preventDefault();
                        document.getElementById("virtual-file-name").value = itemPath;
                    }
                }
            }
            listItem.appendChild(link);
            fileList.appendChild(listItem);
        }
      });
      document.getElementById('virtual-file-name').hidden = false;
      document.getElementById('file-list-popup-ok').hidden = false;;
      if (mode === "open") {
        showPopup("open");
      } else if (mode === "save") {
        showPopup("save");
      }
    } catch (error) {
      console.error('Error fetching repository contents:', error);
    }
  }

// ... (existing code) ...

async function downloadAllFilesAsZip() {
    /**
     * Download all files in /workdir and its subdirectories as a zip archive.
     */
    let pyodide = await pyodideReadyPromise;
  
    try {
      // 1. Get a list of all files and directories in /workdir
      const filesAndDirs = await pyodide.FS.readdir('/workdir');
  
      // 2. Create a new JSZip instance
      const zip = new JSZip();
  
      // 3. Recursively traverse the directory structure
      const traverseDirectory = async (path) => {
        const contents = await pyodide.FS.readdir(path);
        for (const item of contents) {
          if (item === '..' || item === '.') {
            continue;
          }
          const fullPath = `${path}/${item}`;
          const info = pyodide.FS.lookupPath(fullPath);
          if (pyodide.FS.isDir(info.node.mode)) {
            // If it's a directory, recursively traverse it
            await traverseDirectory(fullPath);
          } else {
            // If it's a file, add it to the zip archive
            const fileContent = await pyodide.FS.readFile(fullPath, { encoding: 'utf8' });
            const relativePath = fullPath.replace('/workdir', '');
            zip.file(relativePath, fileContent);
          }
        }
      };
  
      // 4. Start the traversal from /workdir
      await traverseDirectory('/workdir');
  
      // 5. Generate the zip archive
      const zipContent = await zip.generateAsync({ type: 'blob' });
  
      // 6. Create a download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipContent);
      link.download = 'workdir.zip';
      link.click();
    } catch (error) {
      console.error('Error downloading files:', error);
      // Handle the error appropriately (e.g., display an error message)
    }
  }
  
  // ... (existing code) ...
  
