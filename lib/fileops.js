// Function to upload a file to the virtual filesystem/workdir
async function uploadFile(filename, fileContent) {
    let pyodide = await pyodideReadyPromise;
    // Write the file content to the /workdir
    await pyodide.FS.writeFile(`/workdir/${filename}`, fileContent);
    stdout_func(`File ${filename} loaded successfully.`);
}
// Function to open the file selector
async function uploadFileSelector() {
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
            await uploadFile(filename, fileContent);
        };
        reader.readAsText(file);
        }
    });
    fileInput.click();
}


async function showFSContents(path = '.') {
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