const customName = document.getElementById('customname');
const randomize = document.querySelector('.randomize');
const story = document.querySelector('.story');

function randomValueFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

let storyText = "It was 67 fahrenheit outside, so :insertx: went for a walk. When he got to :inserty:, he stared in horror for a few moments, then :insertz:. Bob saw the whole thing, but he was not surprised — :insertx: weighs 280, and it was a warm spring day.";
let insertX = ['Dwane The Rock Johnson', 'Robert Oppenheimer', 'Tim Cook'];
let insertY = ['the dingy alley behind Red Lobster', 'the McDonalds on Baseline', 'Sports Authority Field at Mile High'];
let insertZ = ['was smited by the very hand of God', 'became weightless and floated away like a balloon', 'ate some bacon and died of sodium poisoning'];

randomize.addEventListener('click', result);

function result() {
    let newStory = storyText;
    let xItem = randomValueFromArray(insertX);
    let yItem = randomValueFromArray(insertY);
    let zItem = randomValueFromArray(insertZ);
  
    newStory = newStory.replace(':insertx:', xItem);
    newStory = newStory.replace(':insertx:', xItem);
    newStory = newStory.replace(':inserty:', yItem);
    newStory = newStory.replace(':insertz:', zItem);
  
    if (customName.value !== '') {
      newStory = newStory.replace('Bob', customName.value);
    }
  
    if (document.getElementById('uk').checked) {
      let weight = Math.round(280 * 0.071429) + ' stone';
      let temperature = Math.round((67 - 32) * 5 / 9) + ' centigrade';
      newStory = newStory.replace('67 fahrenheit', temperature);
      newStory = newStory.replace('280', weight);
    } else {
      newStory = newStory.replace('280', '280 pounds');
    }
  
    story.textContent = newStory;
    story.style.visibility = 'visible';
  }
