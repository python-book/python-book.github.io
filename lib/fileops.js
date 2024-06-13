// Function to upload a file to the virtual filesystem/workdir
async function saveFile(filename, fileContent) {
    /**
     * save fileContent to filename into the temp virtualFS of pyodide.
     */
    let pyodide = await pyodideReadyPromise;
    // Write the file content to the /workdir
    await pyodide.FS.writeFile(`/workdir/${filename}`, fileContent);
    stdout_func(`File ${filename} loaded successfully.`);
    // Sync the filesystem
    await pyodide.FS.syncfs(true,  function (err) {
        if (err) {
            console.error("Error syncing filesystem:", err);
        } else {
            document.getElementById("output").innerText = "Filesystem synced successfully";
        }
        });
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
            await saveFile(filename, fileContent);
        };
        reader.readAsText(file);
        }
    });
    fileInput.click();
}


async function showFSContents(path = '.') {
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
            link.onclick = (event) => {
            event.preventDefault();
            if (isDir) {
                showFSContents(itemPath);
            } else {
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
            };
            listItem.appendChild(link);
            fileList.appendChild(listItem);
        }
      });
      showPopup();
    } catch (error) {
      console.error('Error fetching repository contents:', error);
    }
  }

// let zipResponse = await fetch("https://github.com/python-book/python-book/archive/refs/heads/main.zip");
// let zipBinary = await zipResponse.arrayBuffer();
// pyodide.unpackArchive(zipBinary, "zip");
