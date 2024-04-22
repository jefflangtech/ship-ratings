const templateContainer = document.getElementById('template-container');
const filesForm = document.getElementById('files-form');
const formHeader = document.getElementById('form-header');
const confirmButtons = document.querySelectorAll('.confirm-btn');
const templatesDir = '/api/templates';
const responseContainer = document.getElementById('response-container');

const socket = new WebSocket(`ws://${window.location.host}/sockets`);
// Test code for the web socket
socket.onmessage = function (event) {
  let msg = JSON.parse(event.data);
  console.log(msg);
  let statusUpdate = JSON.parse(event.data);
};

socket.onopen = function(event) {
  console.log('Websocket connection opened');
  socket.send('Hello from the client');
};

socket.onerror = function(event) {
  console.error('Websocket error:', event);
};

socket.onclose = function(event) {
  console.log('Websocket connection closed:', event);
};





// Provided with a directory will return an array of file names inside
async function fetchFilesArray(fileDirectory) {
  try {
    const response = await fetch(fileDirectory);
    if (!response.ok) {
      throw new Error('Network response error');
    }
    const filesArray = await response.json();
    return filesArray;
  } catch (error) {
    console.error('Error in fetch operation:', error);
  }
}

async function uploadFile() {
  const formData = new FormData(filesForm);
  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Network response error');
    }
    const result = await response.json();
    filesForm.reset();
    console.log(result);
    return result;
  } catch (error) {
    console.error('Error during post action:', error);
    throw error; // Re-throw the error if you want to handle it later
  }
}

async function confirmData(data) {

  try {
    const response = await fetch('/upload-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if(!response.ok) {
      throw new Error('Network response error');
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error during post action: ', error);
    throw error;
  }
}


function createTemplateLinks(links) {
  links.forEach(link => {
    const li = document.createElement('li');
    const alink = document.createElement('a');
    alink.href = `/templates/${link}`;
    alink.download = link;
    alink.textContent = `Download ${link}`;
    li.appendChild(alink);
    templateContainer.appendChild(li);
  });
}

function updateFileResponse(element, type, filename) {

  element.replaceChildren();

  const p1 = document.createElement('p');
  const p2 = document.createElement('p');
  p1.textContent = `Data uploaded: ${type}`;
  element.appendChild(p1);
  p2.textContent = `File name: ${filename}`;
  element.appendChild(p2);

}


fetchFilesArray(templatesDir)
  .then(files => {
    createTemplateLinks(files);
  })
  .catch(error => {
    console.error('Error when fetching files:', error);
  })

function updateButtonAttributes(button, filename, fileuploadname, filepath, csvDataType) {
  button.setAttribute('data-filename', filename);
  button.setAttribute('data-fileuploadname', fileuploadname);
  button.setAttribute('data-filepath', filepath);
  button.setAttribute('data-csvdatatype', csvDataType);
}

function removeButtonAttributes(button) {
  button.removeAttribute('data-filename');
  button.removeAttribute('data-fileuploadname');
  button.removeAttribute('data-filepath');
  button.removeAttribute('data-csvdatatype');
}

function confirmResponseUpdateUI(res) {

  const elTarget = document.getElementById(res.type);
  const msg = elTarget.previousElementSibling;
  const btns = elTarget.nextElementSibling;
  
  msg.classList.toggle('hidden');
  Array.from(btns.children).forEach(btn => { 
    btn.classList.toggle('hidden');
    removeButtonAttributes(btn);
  });

}



// Event listeners
filesForm.addEventListener('submit', async function(event) {
  event.preventDefault();
  result = await uploadFile();

  const elTarget = document.getElementById(result.csvDataType);

  // If a duplicate address or package file template is uploaded after one 
  // has already been submitted
  if(result.fileduplicate) {
    const msg = elTarget.previousElementSibling;
    const btns = elTarget.nextElementSibling;

    msg.classList.toggle('hidden');
    Array.from(btns.children).forEach(btn => { 
      btn.classList.toggle('hidden');
      updateButtonAttributes(btn, result.filename, result.fileuploadname, result.filepath, result.csvDataType);
      updateFileResponse(elTarget, result.csvDataType, result.filename);
    });
  }
  else {
    updateFileResponse(elTarget, result.csvDataType, result.filename);
  }

});

confirmButtons.forEach(btn => btn.addEventListener('click', async function(event) {
  
  const btn = event.target;
  const filename = btn.getAttribute('data-filename');
  const fileuploadname = btn.getAttribute('data-fileuploadname');
  const filepath = btn.getAttribute('data-filepath');
  const csvDataType = btn.getAttribute('data-csvDataType');
  const reset = btn.classList.contains('yes');

  console.log(filename, csvDataType, reset);

  const dataToSend = {
    filename: filename,
    fileuploadname: fileuploadname,
    filepath: filepath,
    csvDataType: csvDataType,
    resetFlag: reset
  };

  result = await confirmData(dataToSend);
  confirmResponseUpdateUI(result);

}));