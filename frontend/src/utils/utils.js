import axios from 'axios';
import { ethers } from 'ethers';

export const ETH_NODE = 'https://mainnet.infura.io/v3/45eb0e4b59274a35afc5493241b5faf9'



//BUILDINGS & RESOURCES
export function getResourceName(type){
    let resourceName = null;
    if(type == 1) resourceName = 'ANCIEN' 
    if(type == 2) resourceName = 'ANCIENWOOD' 
    if(type == 3) resourceName = 'ANCIENSTONE' 
    if(type == null) return false
    return resourceName;
}



//BLOCKCHAIN
export function isAddress(address){
    let regex=/^0x[a-fA-F0-9]{40}$/;
    return regex.test(address);
}
export function isENS(address){
    return address.includes('.eth')
}
export async function resolveENS(address){
    if(!isENS(address)) return address

    let _endPoint;
    let _resolvedAddress;
    try{
        _endPoint = new ethers.providers.JsonRpcProvider(ETH_NODE);
        _resolvedAddress = await _endPoint.resolveName(address)
        return _resolvedAddress
    }catch{ return address }
}



//DATE
export function getRemainingTime_InMinute(endingTime){
    var startDate = new Date();
    var endDate   = new Date(endingTime);
    var diff = endDate.getTime() - startDate.getTime();

    return diff 
}
export function msToTime(duration) {
    let milliseconds = parseInt((duration % 1000));
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)));

    hours = hours.toString().padStart(2, '0');
    minutes = minutes.toString().padStart(2, '0');
    seconds = seconds.toString().padStart(2, '0');
    milliseconds = milliseconds.toString().padStart(3, '0');

    return {
      hours,
      minutes,
      seconds,
      milliseconds
    };
}
export function getShortData(data){
    let shortData = data;
    if(shortData){ 
      shortData = new Date(shortData);
      shortData = shortData.toString();
      shortData = 
        '(' +
        shortData.split(' ')[1] + ' '
        + shortData.split(' ')[2] + ') '
        + shortData.split(' ')[4].split(':')[0] + ':'
        + shortData.split(' ')[4].split(':')[1] 
    }
    return shortData 
}



//NUMBERS
export function isInt(n){
    return Number(n) === n && n % 1 === 0;
}
export function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}
export function isNegative(num) {
    if (Math.sign(num) === -1) return true;
    else return false;
}
export function roundMinOne(num) {
    let returnValue = 0;
    num >= 1  
    ? returnValue = Math.floor(num)
    : returnValue = 0
    return returnValue;
}
export function format(num) {
    let newValue = num;
    if(newValue){
        newValue = Math.trunc(newValue*100)/100;
        newValue =  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    } 
    return newValue
}
export function toFixed(num, fixed = 2) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return parseFloat(num.toString().match(re)[0])
}



//STRINGS
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}



//INPUTS
export function isInputQuantityBannedChar(code){
    if (code === 'Minus') return true
    if (code === 'NumpadSubtract') return true
    if (code === 'Period') return true
    if (code === 'NumpadDecimal') return true
    if (code === 'Equal') return true
    if (code === 'NumpadAdd') return true
    if (code === 'Comma') return true
    if (code === 'KeyE')  return true
    return false
}
export function isInputPriceBannedChar(code){
    if (code === 'Minus') return true
    if (code === 'NumpadSubtract') return true
    if (code === 'NumpadDecimal') return true
    if (code === 'Equal') return true
    if (code === 'NumpadAdd') return true
    if (code === 'Comma') return true
    if (code === 'KeyE')  return true
    return false
}



//VALIDATION
export function checkUrl(urlToFile) {
    axios.get(urlToFile)
    .then(res => {return true})
    .catch(err => {return false})
};