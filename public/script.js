let counter = 0;
let rate = 1;
let upgradeCost = 100;

const tapButton = document.getElementById('tapButton');
const counterDisplay = document.getElementById('counter');
const upgradeButton = document.getElementById('upgradeButton');
const upgradeInfo = document.getElementById('upgradeInfo');

tapButton.addEventListener('click', () => {
    counter += rate;
    counterDisplay.textContent = counter;
});

upgradeButton.addEventListener('click', () => {
    if (counter >= upgradeCost) {
        counter -= upgradeCost;
        rate *= 2;
        upgradeCost *= 2;
        counterDisplay.textContent = counter;
        upgradeInfo.textContent = `Next Upgrade Cost: ${upgradeCost}`;
    }
});
