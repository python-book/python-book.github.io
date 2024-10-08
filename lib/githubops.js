// deprecaded, will use download whole zipball and extract to VFS instead 
// opening individual files using this lib (because many modules call each other)

async function fetchRepoContents({owner='python-book', repo='python-book', path='', branch='main'}) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    let data;
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`GitHub API returned status ${response.status}`);
      }
  
      data = await response.json();
  
      // Check if the response is an array (directory contents)
      if (Array.isArray(data)) {
        // data.forEach(item => {
        //   console.log(`list github ${item.type} ${item.name}`);
        // });
      } else {
        console.log('Specified path is not a directory or does not exist.');
      }
    } catch (error) {
      console.error('Error fetching repository contents:', error);
    }
    return data;
  }
async function showRepoContents(path = '') {
    try {
      const contents = await fetchRepoContents({path});
      const fileList = document.getElementById('fileList');
      fileList.innerHTML = ''; // Clear existing list
        if (path !== "") {
            let parent_path = path.split('/');
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            parent_path.pop();
            parent_path=parent_path.join('/');
            link.textContent = "..";
            link.href = `#`;
            link.onclick = (event) => {
            event.preventDefault();
            showRepoContents(parent_path);
            };
            listItem.appendChild(link);
            fileList.appendChild(listItem);
        }

      contents.forEach(item => {
        if (item.name.startsWith('.'))
        {
        } else {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.textContent = item.name + (item.type == "dir" ? "/" : "");
            link.href = '#';
            link.onclick = (event) => {
            event.preventDefault();
            if (item.type === 'dir') {
                showRepoContents(item.path);
            } else if (item.type === 'file') {
                closeFileListPopup();
                console.log(`File selected: ${item.path}`);
                fetchGitRepoFile(item.path);
            }
            };
            listItem.appendChild(link);
            fileList.appendChild(listItem);
        }
      });
    document.getElementById('virtual-file-name').hidden = true;
    document.getElementById('file-list-popup-ok').hidden = true;;
    showPopup();
    } catch (error) {
      console.error('Error fetching repository contents:', error);
    }
  }

  function fetchGitRepoFile(path) {
    actual_path = "/python-book/" + path;
    fetch(actual_path)
    .then(response => {
        if (!response.ok) {
        throw new Error(`Error fetching content of ${path}: ${response.status} ${response.statusText}`);
        }
        return response.text();
    })
    .then(data => {
      window.editor.setValue(data);
      const tabId = window.editor.getWrapperElement().parentElement.dataset.tabId;
      targetTab = document.querySelector(`.tab[data-tab-id="${tabId}"]`)
      targetButton = targetTab.querySelector(`.tab-button`);
      targetButton.textContent = path;

      // Write the file content to the /workdir
      saveFile(`/workdir/${path}`, data)
        .then(res=>stdout_func(`File ${path} loaded successfully.`))
    })
    .catch(error => {
      console.error(`Error fetching content of ${path}:`, error);
    });
    return 0;
  }


