import { TOKEN } from "./config.js";

const baseUrl = `https://app.ticketmaster.com/discovery/v2/events.json`;
// Input elements
const artistInput = document.querySelector("#artist-input");
const radiusInput = document.querySelector("#radius-input");
const submitButton = document.querySelector("#submit-button");
const sortButton = document.querySelector("#sort-button");

// Set up event listener for buttons
submitButton.addEventListener("click", function (event) {
  event.preventDefault();
  handleSubmit();
});
sortButton.addEventListener("click", function (event) {
  event.preventDefault();

  handleSort();
});

// Output elements
const eventOutputParent = document.querySelector("#results");

let latLong = [];
navigator.geolocation.getCurrentPosition(
  (position) =>
    (latLong = [position.coords.latitude, position.coords.longitude])
);

function createCard(event) {
  let newCard = document.createElement("div");
  newCard.className = "card";
  let cardTitle = document.createElement("h5");
  cardTitle.className = "card-title m-3 text-left";
  cardTitle.innerText = event.name;
  let distance = document.createElement("p");
  distance.className = "text-center";
  distance.innerText = event.distance + " miles away";
  let cardImage = document.createElement("img")
  cardImage.className = "card-img-top";
  cardImage.src = event.image;
  let cardLink = document.createElement("a");
  cardLink.href = event.link;
  cardLink.innerText = "More info";
  cardLink.className = "btn btn-primary m-2";
  newCard.appendChild(cardImage);
  newCard.appendChild(cardTitle);
  newCard.appendChild(distance);
  newCard.appendChild(cardLink);
  newCard.setAttribute("distance", event.distance);
  eventOutputParent.appendChild(newCard);
}

let formatEvents = (event) => {
  let prettyEvent = {
    name: event.name,
    image: event.images[2].url,
    link: event.url,
    distance: event.distance
  };
  return prettyEvent;
}

function searchEvents(artists, radius) {
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  let events = [];
  artists.map((artist) => {
    let url = `${baseUrl}?keyword=${artist}&latlong=${latLong[0]},${latLong[1]}&radius=${radius}&apikey=${TOKEN}`;
    fetch(url, requestOptions)
    .then((response) => {return response.json()})
    .then((data) => {
      if (typeof data._embedded != "undefined") {
        let prettyEvent = formatEvents(data._embedded.events[0]);
        return prettyEvent;
      }
    })
    .then((event) => {return createCard(event)})
    .catch((error) => console.log(error));
  });
  return events;
}

function handleSubmit() {
  eventOutputParent.innerHTML = "";
  const artists = artistInput.value.split(",");
  const radius = radiusInput.value;
  let events = searchEvents(artists, radius);
  events.shift();
  // Add name, image, and link into card. display that on page.
  createCard(events.title, events.image, events.link);
}

function handleSort() {
  let cards = document.querySelectorAll(".card");
  let cardsArr = Array.from(cards);
  console.log(cardsArr);
  cardsArr.sort(function(a, b) {
    return Number(a.getAttribute("distance")) - Number(b.getAttribute("distance"));
  })
  eventOutputParent.innerHTML = "";
  cardsArr.map((card) => eventOutputParent.appendChild(card));  
}
