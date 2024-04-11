const getDataBtn = document.querySelector("#js-get-data");
getDataBtn.addEventListener('click', getCarData);

const carDataSection = document.querySelector('#js-car-data');

const apiEndpoint = 'https://api.api-ninjas.com/v1/cars?model=';

async function getCarData() {
    const model = document.querySelector("#car-model").value;
    if (!model) {
        alert('Please enter a car model');
        return;
    }

    const url = apiEndpoint + model;
    const headers = { 'X-Api-Key': 'kRU0gB74TYgCCJDBY+X6jQ==2pkAd0aOeosllBuj' };

    try {
        const response = await fetch(url, { method: 'GET', headers: headers });
        if (!response.ok) {
            throw Error(response.statusText);
        }

        const json = await response.json();
        console.log(json);
        displayCarData(json);
    } catch (err) {
        console.log(err);
        alert('Failed to fetch car data');
    }
}

function displayCarData(data) {
    carDataSection.innerHTML = ''; 
    if (data && data.length > 0) {
        const car = data[0]; 
        carDataSection.innerHTML = `
            <div>Make: ${car.make}</div>
            <div>Model: ${car.model}</div>
            <div>Year: ${car.year}</div>
            <div>Class: ${car.class}</div>
            <div>Fuel Type: ${car.fuel_type}</div>
            <div>City MPG: ${car.city_mpg}</div>
            <div>Highway MPG: ${car.highway_mpg}</div>
            <div>Combined MPG: ${car.combination_mpg}</div>
            <div>Cylinders: ${car.cylinders}</div>
            <div>Displacement: ${car.displacement}</div>
            <div>Drive: ${car.drive}</div>
            <div>Transmission: ${car.transmission}</div>
        `;
        displayCarImage(car.make, car.model); 
    } else {
        carDataSection.innerHTML = '<div>No data found for the entered model</div>';
    }
}

const randomModelBtn = document.querySelector("#js-random-model");
randomModelBtn.addEventListener('click', setRandomModel);

const carModels = ['Camry', 'Accord', 'Corolla', 'Mustang', 'Charger', 'Model S', 'Model 3', 'F150', 'Silverado', 'Forte']; // Add more car models as needed

function setRandomModel() {
    const randomIndex = Math.floor(Math.random() * carModels.length);
    const randomModel = carModels[randomIndex];
    document.querySelector("#car-model").value = randomModel;
}

const unsplashAccessKey = '1SSnzvnd-XybF_zpqsY7__oy52c7cmd_2hiogfZwcAo';

async function displayCarImage(make, model) {
    const query = `${model} car`;
    const url = `https://api.unsplash.com/search/photos?page=1&query=${query}&collections=195369&client_id=${unsplashAccessKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw Error(response.statusText);
        }

        const json = await response.json();
        const imageUrl = json.results[0]?.urls?.regular; 
        if (imageUrl) {
            const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            imageElement.alt = `${make} ${model}`;
            imageElement.classList.add('car-image');
            carDataSection.appendChild(imageElement); 
        }
    } catch (err) {
        console.log(err);
        alert('Failed to fetch car image');
    }
}