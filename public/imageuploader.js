document.addEventListener('DOMContentLoaded', function () {
    const imageInput = document.getElementById('imageInput');
    const uploadButton = document.getElementById('uploadButton');
    const imageList = document.getElementById('imageList');
    const imageDisplay = document.getElementById('imageDisplay');
    const deleteButton = document.getElementById('deleteButton');
    const backLink = document.getElementById('backLink'); // Back to Gallery link
    const backButton = document.getElementById('backButton'); // Back button

    // Load existing images from local storage
    let savedImages = JSON.parse(localStorage.getItem('images')) || [];

    // Display existing images in the list
    savedImages.forEach((imageData, index) => {
        addImageToList(imageData, index);
    });

    // Event listener for the upload button
    uploadButton.addEventListener('click', () => {
        imageInput.click();
    });

    // Event listener for file input change
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imageData = {
                    dataURL: e.target.result,
                    filename: file.name,
                };
                savedImages.push(imageData);
                localStorage.setItem('images', JSON.stringify(savedImages));
                addImageToList(imageData, savedImages.length - 1);
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please upload a valid image file.');
        }
    });

    // Function to add an image to the list
    function addImageToList(imageData, index) {
        const imageItem = document.createElement('div');
        imageItem.classList.add('document');
        imageItem.innerHTML = `
            <span>${imageData.filename}</span>
            <button class="delete-button" data-index="${index}">Delete</button>
        `;
        imageList.appendChild(imageItem);

        const deleteButton = imageItem.querySelector('.delete-button');
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the click event from reaching the parent element
            const index = parseInt(event.target.getAttribute('data-index'));
            if (!isNaN(index)) {
                deleteImage(index);
                imageItem.remove();
                const displayedImageIndex = parseInt(imageDisplay.dataset.index, 10);
                if (!isNaN(displayedImageIndex) && displayedImageIndex === index) {
                    imageDisplay.innerHTML = '';
                    imageDisplay.style.display = 'none';
                }
            }
        });

        imageItem.addEventListener('click', () => {
            displayImage(imageData, index);
        });
    }

    // Function to delete an image
    function deleteImage(index) {
        savedImages = savedImages.filter((_, i) => i !== index);
        localStorage.setItem('images', JSON.stringify(savedImages));
    }

    // Function to display the selected image
    function displayImage(imageData, index) {
        const image = new Image();
        image.src = imageData.dataURL;
        image.alt = imageData.filename;
        imageDisplay.innerHTML = '';
        imageDisplay.appendChild(image);
        imageDisplay.style.display = 'flex';
        imageDisplay.dataset.index = index;
        backLink.style.display = 'block';
        backButton.style.display = 'block';
    }

    // Handle the "Back to Gallery" link click
    backLink.addEventListener('click', (e) => {
        e.preventDefault();
        imageDisplay.style.display = 'none';
        backLink.style.display = 'none';
        backButton.style.display = 'none';
    });

    // Handle the "Back" button click
    backButton.addEventListener('click', () => {
        imageDisplay.style.display = 'none';
        backLink.style.display = 'none';
        backButton.style.display = 'none';
    });
});
