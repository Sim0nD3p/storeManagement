function convertToSEP(code){
    if(code.slice(0, 3) == 'SEP' && code.charAt(3) == '-'){
        code = 'CRISS_DE_EXCEL' + code.slice(4)
    }
    else if(code.slice(0, 3) == 'SEP' && code.length == 7){
        code = 'CRISS_DE_EXCEL' + code.slice(3);
    }
    return code
}
module.exports = convertToSEP;