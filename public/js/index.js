const templateContainer = document.getElementById('template-container');
const addressForm = document.getElementById('address-form');
const formHeader = document.getElementById('form-header');
const templatesDir = '/api/templates';

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

function uploadFile() {
  const formData = new FormData(addressForm);

  fetch('/upload', {
    method: 'POST',
    body: formData,
  })
  .then(response => {
    if(!response.ok) {
      throw new Error('Network response error');
    }
    return response.json();
  })
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error('Error during post action', error);
  });
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


fetchFilesArray(templatesDir)
  .then(files => {
    createTemplateLinks(files);
  })
  .catch(error => {
    console.error('Error when fetching files:', error);
  })

// Event listeners
addressForm.addEventListener('submit', function(event) {
  event.preventDefault();
  uploadFile();
});