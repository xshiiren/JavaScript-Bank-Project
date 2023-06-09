'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2023-05-23T23:36:17.929Z',
    '2023-05-26T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-24T18:49:59.371Z',
    '2020-06-25T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};
/*
const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};
*/

const accounts = [account1, account2 /*, account3, account4*/];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const formatMovementsDate = function (date, locale) {
  const CalcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPasses = CalcDaysPassed(new Date(), date);
  if (daysPasses === 0) return 'Today';
  if (daysPasses === 1) return 'Yesterday';
  if (daysPasses <= 7) return `${daysPasses} days ago`;

  // const day = `${date.getDate()}`.padStart(2, '0');
  // const month = `${date.getMonth() + 1}`.padStart(2, '0');
  // const year = date.getFullYear();
  // return `${month}/${day}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementsDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  let time = 300;
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');
    // in each call, print the reamainnig to UI
    labelTimer.textContent = `${min}:${seconds}`;

    // when timer reaches 0, log out user
    if (time == 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    time--;
  };

  // set time to 5 minutes
  // cakk the timer every second
  const timer = setInterval(tick, 1000);
  return timer;
};
///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// EXPERIMENTING WITH PAI
const now = new Date();
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  // weekday: 'long',
};

// labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    const locale = navigator.language;
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // create current date
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, '0');
    // const month = `${now.getMonth() + 1}`.padStart(2, '0');
    // const year = now.getFullYear();
    // const hour = now.getHours();
    // const minute = `${now.getMinutes()}`.padStart(2, '0');
    // labelDate.textContent = `${day}/${month}/${year} ${hour}:${minute}`;
    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    sorted = false;
    // Update UI
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toDateString());
    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(new Date().toDateString());

    // Update UI
    updateUI(currentAccount);

    // reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      // Add movement
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    if (
      confirm(
        `${currentAccount.owner}, Are you sure you want to delete your account?`
      ) === true
    ) {
      if (prompt('Type "CONFIRM" to delete your account') !== 'CONFIRM') {
        return false;
      }
    } else {
      return false;
    }

    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

///////////////////
/*
// Coding challenge #1

const checkDogs = function (dogsJulia, dogsKate) {
  let dogsJuliaCorrected = dogsJulia.slice(1, -2);
  let dogs = dogsJuliaCorrected.concat(dogsKate);
  dogs.forEach(function (years, i) {
    const age =
      years >= 3
        ? `Dog number ${i + 1} is an adult, and is ${years} years old.`
        : `Dog number ${i + 1} is still a puppy 🐶`;
    console.log(age);
  });
};
checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);
checkDogs([3, 1, 15, 8, 3], [10, 5, 6, 1, 4]);
/////////////////////////////////////////////////

let arr = ['a', 'b', 'c', 'd', 'e'];

// slice
console.log(arr.slice(2));
console.log(arr.slice(2, 4));
console.log(arr.slice(-2));
console.log(arr.slice(1, -1));
console.log(arr.slice());
console.log(...arr);

//splice
//console.log(arr.splice(2));
//arr.splice(-1);
arr.splice(1, 2);
console.log(arr);

// Reverese

arr = ['a', 'b', 'c', 'd', 'e'];
const arr2 = ['j', 'i', 'h', 'g', 'f'];
console.log(arr2.reverse());
console.log(arr2);

// concat
const letters = arr.concat(arr2);
console.log(letters);
// same thing as concat
console.log(...arr, ...arr2);

// join
console.log(letters.join(' - '));


const arr = [23, 11, 63];
console.log(arr[0]);
console.log(arr.at(0));

// getting last element
console.log(arr.at(arr.length - 1));
console.log(arr.slice(-1)[0]);
console.log(arr.at(-1));

console.log('Jason'.at(0));


const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// for (const movement of movements) {
for (const [i, movement] of movements.entries()) {
  if (movement > 0) {
    console.log(`Movement ${i + 1} You deposited ${movement}`);
  } else if (movement < 0) {
    console.log(`Movement ${i + 1} You withdrew ${Math.abs(movement)}`);
  }
}

console.log('---ForEach---');
// first current element, second current index, third entire array
movements.forEach(function (mov, i, arr) {
  if (mov > 0) {
    console.log(`Movement ${i + 1} You deposited ${mov}`);
  } else if (mov < 0) {
    console.log(`Movement ${i + 1} You withdrew ${Math.abs(mov)}`);
  }
});
// 0: function(200)
// 1:function(450)... until end of array


const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

// Map
currencies.forEach(function (value, key, Map) {
  console.log(`${key}: ${value} `);
});

// set
const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
console.log(currenciesUnique);
currenciesUnique.forEach(function (value, _, Map) {
  console.log(`${value}: ${value}`);
});


const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const euroToUsd = 1.1;

const movementsUsd = movements.map(mov => mov * euroToUsd);

console.log(movements);
console.log(movementsUsd);

const movementsUsdFor = [];
for (const mov of movements) {
  movementsUsdFor.push(mov * euroToUsd);
}
console.log(movementsUsdFor);

const movementUsdStg = movements.map(
  (mov, i) => `Movement ${i + 1}: You deposited ${mov}`
);
console.log(movementUsdStg);


const arr = [1, 2, 3, 4, 5, 6, 7];
console.log(new Array(1, 2, 3, 4, 5, 6, 7));

// 7 empty arrays
const x = new Array(7);
console.log(x);

x.fill(1, 3, 5);
console.log(x);
x.fill(1);
console.log(x);

arr.fill(23, 2, 6);
console.log(arr);

const y = Array.from({ length: 7 }, () => 1);
console.log(y);

const z = Array.from({ length: 7 }, (cur, i) => i + 1);
console.log(z);

const diceRolls = Array.from({ length: 100 }, () =>
  Math.floor(Math.random() * 6 + 1)
);
console.log(diceRolls);

labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    // callbakc function can be called here instead of the console.log()
    el => Number(el.textContent.replace('$', ''))
  );

  console.log(movementsUI);
});

// this also can create arrays from arraylike elemnts
const movementsUI2 = [...document.querySelectorAll('.movements__value')];


//1.
const bankDepostiSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 0)
  .reduce((sum, mov) => sum + mov);
console.log(bankDepostiSum);

//2.
const numdeposits1000 = accounts
  .flatMap(acc => acc.movements)
  // both work
  // .filter(mov => mov >= 1000).length
  .reduce((acc, cur) => (cur >= 1000 ? ++acc : acc), 0);
console.log(numdeposits1000);

//3.
const { deposits, withdrawals } = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, cur) => {
      // same but second one its cleaner
      // cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
      sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur;
      return sums;
    },
    { deposits: 0, withdrawals: 0 }
  );
console.log(deposits, withdrawals);

//4.
// this is a nice title => This Is a Nice Title

const convertTitleCase = function (title) {
  const capitalize = str => str[0].toUpperCase() + str.slice(1);
  const exceptions = ['a', 'an', 'the', 'but', 'or', 'on', 'in', 'with', 'and'];

  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word =>
      exceptions.includes(word) ? word : word[0].toUpperCase() + word.slice(1)
    )
    .join(' ');

  return titleCase[0].toUpperCase() + titleCase.slice(1);
};
console.log(convertTitleCase('this is a nice title'));
console.log(convertTitleCase('this is a LONG title but not too long'));
console.log(convertTitleCase('and here is another title with an EXAMPLE'));


const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

dogs.forEach(dog => (dog.recFood = Math.trunc(dog.weight * 0.75 * 28)));

const sarahsDog = dogs.find(dog => dog.owners.includes('Sarah'));
console.log(
  `Sarah's dog is eating ${
    sarahsDog.curFood > sarahsDog.recFood ? `too much` : `too little`
  }`
);

let ownersEatTooMuch = [];
let ownersEeatTooLittle = [];

dogs
  .map(dog => dog)
  .reduce(
    (acc, dog) =>
      dog.curFood > dog.recFood && dog.curFood !== dog.recFood
        ? ownersEatTooMuch.push(dog.owners)
        : ownersEeatTooLittle.push(dog.owners),
    0
  );

console.log(ownersEatTooMuch.flat().join(' and ') + ' is eating too Much!');
console.log(
  ownersEeatTooLittle.flat().join(' and ') + ' is eating too Little!'
);

console.log(dogs.some(dog => dog.recFood === dog.curFood));

const DogsEatingOkay = dog =>
  dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1;

console.log(dogs.some(DogsEatingOkay));

console.log(dogs.filter(DogsEatingOkay));

const dogPortions = dogs.slice().sort((a, b) => a.recFood - b.recFood);
console.log(dogPortions);
console.log(dogs);


console.log(23 === 23.0);
console.log(0.1 + 0.2);
console.log(Number((0.1 + 0.2).toFixed(2)) === 0.3);

//conversion
console.log(Number('23'));
console.log(+'23');

//parsing
console.log(Number.parseInt('30px')); // needs to start with a number
console.log(Number.parseInt('e30px'));

console.log(Number.parseFloat('2.5rem'));
console.log(Number.parseInt('2.5rem'));
console.log(parseFloat('2.5rem'));

// check if value is not a NaN
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20x'));
console.log(Number.isNaN(23 / 0));

// cheking if value is number
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'20x'));
console.log(Number.isFinite(23 / 0));

console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23 / 0));


console.log(Math.sqrt(25));
console.log(25 ** 0.5);
console.log(25 ** (1 / 2));

console.log(Math.max(5, 3, 7, 1, 5));
console.log(Math.max(5, 3, '23', 1, 5));
console.log(Math.max(5, 3, '23px', 1, 5));

console.log(Math.min(5, 3, 7, 1, 5));

console.log(Math.PI * Number.parseFloat('10') ** 2);

console.log(Math.trunc(Math.random() * 6) + 1);

// plus 1 needs to be inside parenthesis so you can get the min as an answer
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
console.log(randomInt(1, 6));

// rounding integers
console.log(Math.trunc(23.3));

console.log(Math.round(23.7));
console.log(Math.round(23.2));

console.log(Math.ceil(23.7));
console.log(Math.ceil(23.2));

console.log(Math.floor(23.7));
console.log(Math.floor(23.2));

console.log(Math.trunc(-23.3));
console.log(Math.floor(-23.3));

// Rounding decimals
// to fixed changes input to a string
console.log((2.7).toFixed(0));
console.log((2.763).toFixed(3));
console.log((2.76).toFixed(2));
console.log(+(2.76).toFixed(2));


console.log(5 % 2);

console.log(8 % 3); // 8 = 2 * 3 + 2
console.log(8 / 3);

console.log(6 % 2);
console.log(6 / 2);

console.log(7 % 2);
console.log(7 / 2);

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(535));
console.log(isEven(14));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) {
      row.style.backgroundColor = 'orangered';
    }
    if (i % 3 === 0) {
      row.style.backgroundColor = 'blue';
    }
  });
});


// underscores do NOT work with number conversions
// 287,460,000,000
const diameter = 287_460_000_000;
console.log(diameter);

const price = 245_99;
console.log(price);

const transfer = 15_00;
const transfer2 = 1_500;

const PI = 3.1415;
console.log(PI);
console.log(Number('230_000'));
console.log(parseInt('230_000'));

console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

console.log(typeof 9405890157425207528907n);
console.log(9405890157425207528907n);
console.log(BigInt(9405890157425207528907));

// operations
console.log(10000n + 10000n);
console.log(100000000000000n + 100000000000000n);

const huge = 144134143143232n;
const num = 23;

//execptions
console.log(huge * BigInt(num));
console.log(20n > 15);
console.log(20n === 20); // false
console.log(20n == 20); // true

console.log(huge + ` is REALLY big!!!`);

//divisions
console.log(10n / 3n);
console.log(10 / 3);


// create a date
const now = new Date();
console.log(now);

console.log(new Date('Thu May 25 2023'));
console.log(new Date('december 24 2015'));
console.log(new Date(account1.movementsDates[0]));

console.log(new Date(2037, 10, 19, 15, 23, 5));
console.log(new Date(2037, 10, 31, 15, 23, 5));

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));


//working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());

console.log(new Date(2142274980000));
console.log(Date.now());
console.log(new Date(1685057800862));

future.setFullYear(2040);
console.log(future);


const future = new Date(2037, 10, 19, 15, 23);
console.log(+future);

const CalcdaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
const days1 = CalcdaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24));
console.log(days1);


const num = 2883753.23;

const options2 = {
  style: 'currency',
  unit: 'celsius',
  currency: 'EUR',
  // useGrouping: false,
};

console.log('US:     ', new Intl.NumberFormat('en-eu', options2).format(num));
console.log(
  'GERMANY:     ',
  new Intl.NumberFormat('de-DE', options2).format(num)
);
console.log(
  'SYRIA:     ',
  new Intl.NumberFormat('ar-SY', options2).format(num)
);
console.log(
  'MEXICO:     ',
  new Intl.NumberFormat('es-MX', options2).format(num)
);


const ingredients = ['olives', 'spinach', 'extra cheese'];

const pizzaTimer = setTimeout(
  function (ing1, ing2) {
    console.log(`here is your pizza with ${ing1}, ${ing2}`);
  },
  1500,
  ...ingredients
);
console.log('Waiting...');

if (ingredients.includes('spinach')) {
  clearTimeout(pizzaTimer);
  console.log('no pizza for you');
}

setInterval(function () {
  const now = new Date();
  const hour = `${now.getHours()}`.padStart(2, '0');
  const minute = `${now.getMinutes()}`.padStart(2, '0');
  const second = `${now.getSeconds()}`.padStart(2, '0');
  console.log(`${hour}:${minute}:${second}`);
}, 1000);
*/
