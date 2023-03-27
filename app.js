//const { ethers } = window;

const contractAddress = "0x7d431E1af86aB4D974bd1de028983b2853143822";
const abi = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "guess",
				"type": "string"
			}
		],
		"name": "game",
		"outputs": [
			{
				"internalType": "uint8[2]",
				"name": "",
				"type": "uint8[2]"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "sendCrypto",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
]
const provider = new ethers.providers.Web3Provider(window.ethereum, 97);
let signer;
let contract

provider.send("eth_requestAccounts", []).then( () => {
  provider.listAccounts().then((accounts) => {
    signer = provider.getSigner(accounts[0]);
    //Создаем объект контракта
    contract = new ethers.Contract(contractAddress, abi, signer);
    console.log(contract);
  });
});


// Отправляем деньги на контракт
async function sendCrypto() {

  
  // Ставим кол-во ethers, которое отправляется по умолчанию
  const value = document.getElementById("inputCrypto").value;
  if(value < 0.0001){
    alert("Not enough crypto. Minumum 0.0001");
    return;
  };

  try{
    const result = await contract.sendCrypto({value: ethers.utils.parseEther(value)});
    document.getElementById("transactionSend").innerHTML = `transaction sent: ${result.hash}`;
    await result.wait;
    document.getElementById("transactionConf").innerHTML = `transaction confirmed: ${result.hash}`;
    
    setTimeout(() => {
      document.getElementById("transactionSend").innerHTML = "";
      document.getElementById("transactionConf").innerHTML = "";
      }, 5000)
      alert("Thank you!");
  } catch(error) {
    document.getElementById("transactionSend").innerHTML = error;
  }
}

// 
async function getResult(userChoice) {
  
  document.getElementById("transactionSend").innerHTML = "";
  // Ставим кол-во ethers, которое отправляется по умолчанию
  const valueToSend = ethers.utils.parseEther("0.0001");
  
  // Параметры транзакции
  const txParams = {
    value: valueToSend
  };
  // пытаемся вызвать функцию с контракта
  try{
    // вызов функции
    const result = await contract.game(userChoice,txParams);
    document.getElementById("transactionSend").innerHTML = `transaction sent: ${result.hash}`;

    // ожидаем пока она подтвердится
    await result.wait();
    document.getElementById("transactionConf").innerHTML = `transaction confirmed: ${result.hash}`;
 
    setTimeout(() => {
      document.getElementById("transactionSend").innerHTML = "";
      document.getElementById("transactionConf").innerHTML = "";
      }, 5000)
    
      //декодируем дату и отправляем
    const decodeResult = ethers.utils.defaultAbiCoder.decode(['uint8[2]'],result.data);
    
    return decodeResult;

  } catch(error) {
    console.log(error)
    alert("Transaction Error. Play Again")
  }
}

//--------------------------------------------------------------------//
//--------------------------------------------------------------------//

let userScore = 0;
let computerScore = 0;

const userScore_span = document.getElementById("user-score");
const computerScore_span = document.getElementById("computer-score");

const scoreBoard_div = document.querySelector(".score-board");
const result_p = document.querySelector(".result > p");

const rock_div = document.getElementById("rock");
const paper_div = document.getElementById("paper");
const scissors_div = document.getElementById("scissors");

const smlUserWord = "(user)".sub();
const smlCompWord = "(comp)".sub();


function game(userChoice) {
    getResult(userChoice).then(result=> {
      let compChoice;
      switch(result[0][1]){
        case 0:
          compChoice = 'rock';
          break;
        case 1:
          compChoice = 'paper';
          break;
        case 2:
          compChoice = 'scissors';
          break;
      }
      checkResult(userChoice, compChoice);
    }).catch(error => {
      console.log(error)
      //document.getElementById("transactionSend").innerHTML = error;
    });
    console.log("    ")
}




function win(userChoice,compChoice) {
  userScore++;
  userScore_span.innerHTML = userScore;
  computerScore_span.innerHTML = computerScore;
  result_p.innerHTML = `${userChoice}${smlUserWord} beats ${compChoice}${smlCompWord} . You win!`;
  document.getElementById(userChoice).classList.add('green-glow');
  setTimeout(() => { document.getElementById(userChoice).classList.remove('green-glow')}, 300)
}

function lose(userChoice,compChoice) {
  computerScore++;
  userScore_span.innerHTML = userScore;
  computerScore_span.innerHTML = computerScore;
  result_p.innerHTML = `${userChoice}${smlUserWord} loses to ${compChoice}${smlCompWord} . You lost!`;
  document.getElementById(userChoice).classList.add('red-glow');
  setTimeout(() => { document.getElementById(userChoice).classList.remove('red-glow')}, 300)
}

function draw(userChoice,compChoice) {
  computerScore++;
  userScore_span.innerHTML = userScore;
  computerScore_span.innerHTML = computerScore;
  result_p.innerHTML = `${userChoice}${smlUserWord} equals  ${compChoice}${smlCompWord} . Its a draw!`;
  document.getElementById(userChoice).classList.add('grey-glow');
  setTimeout(() => { document.getElementById(userChoice).classList.remove('grey-glow')}, 300)
}





function checkResult(userChoice,compChoice) {
  switch(userChoice +" "+ compChoice) {
    case "rock scissors":
    case "paper rock": 
    case "scissors paper":
      console.log(123);
      win(userChoice,compChoice)
      break;
    case "rock paper":
    case "paper scissors":
    case "scissors rock":
      console.log(456);
      lose(userChoice,compChoice)
      break
    case "rock rock":
    case "paper paper":
    case "scissors scissors":
      console.log(789);
      draw(userChoice, compChoice);
  }
}


function main() {
    rock_div.addEventListener('click',() => {
        game("rock");
    })
    
    paper_div.addEventListener('click',() => {
        game("paper");
    })
    
    scissors_div.addEventListener('click',() => {
        game("scissors");
    })
}

main();
