const fs = require('fs')
const myAddress = process.argv[1]
const inputAssemblyAddress = process.argv[2]
const outputHexAddress = process.argv[3] || process.argv[2]
const definedCodes = require('./definedCodes.json')

let assembly = fs.readFileSync(inputAssemblyAddress).toString().match(/[^\r\n]+/g)
fs.writeFileSync(outputHexAddress, 'v2.0 raw\n')

assembly.forEach((code, index) => {
    try {
        let parts = code.split(' '), binedCode
        let op = parts[0].toLowerCase()
        let values = parts.slice(1).join('').split(',')
        op = definedCodes[op];
        if (!op)
            throw new TypeError('instruction is not set in definedCodes.json');
        if (op.func)
            binedCode = rType(values, op)
        else if (op.mem != undefined)
            binedCode = iType(values, op)
        else
            binedCode = jType(values, op)
        console.log(binedCode);
        let hexCode = parseInt(binedCode, 2).toString(16);
        if (hexCode.length === 3)
            hexCode = '0' + hexCode;
        hexCode = hexCode + '\n';
        fs.appendFileSync(outputHexAddress, hexCode)
    }
    catch (e) {
        fs.appendFileSync(outputHexAddress, '')
        e.message = e.message + ' ,in line: ' + (index + 1)
        throw e
    }
})

function rType(values, op) {
    let rdReg = regToBin(values[0])
    let rsReg = regToBin(values[1])
    let shamt = undefined
    let rtReg = isNaN(values[2]) ? regToBin(values[2]) : shamt = immToBin(values[2], 'r')
    let code = '000' + rsReg + (shamt ? rsReg : rtReg) + rdReg + (shamt ? shamt : '0000') + op.func
    return code
}
function iType(values, op) {
    let code, rsReg, imm
    let rtReg = regToBin(values[0])
    if (!op.mem) {
        rsReg = regToBin(values[1])
        imm = immToBin(values[2], 'i')
        code = op.value + rsReg + rtReg + imm
    }
    else {
        let newVal = values[1].match(/([^()])+/g)
        if (newVal.length < 1 || newVal.length > 2)
            throw new TypeError('unknown format or values')
        imm = immToBin(newVal[0], 'i')
        rsReg = newVal[1] ? regToBin(newVal[1]) : rtReg
    }
    code = op.value + rsReg + rtReg + imm
    return code
}
function jType(target, op) {
    target = immToBin(target, 'j', false)
    let code = op.value + target
    return code
}
function regToBin(register) {
    switch (register) {
        case '$0':
            return '00'
        case '$1':
            return '01'
        case '$2':
            return '10'
        case '$3':
            return '11'
        case '$ra':
            return '11'
        case '$zero':
            return '00'
        default:
            throw new TypeError('register is not defined truly');
    }
}
function immToBin(immediate, type) {
    if (isNaN(immediate))
        throw new TypeError('immediate value is not a truly number')
    let imm = parseInt(immediate), binedImm, length, signBit = '0'
    if (imm < 0) {
        imm *= -1
        signBit = '1'
        binedImm = twoComplement(imm.toString(2))
    }
    else
        binedImm = imm.toString(2)
    switch (type) {
        case 'r':
            length = 4 - binedImm.length
            break
        case 'i':
            length = 9 - binedImm.length
            break
        case 'j':
            length = 13 - binedImm.length
            break
        default:
            throw new TypeError('instruction type is not true')
    }
    let signBits = ''
    while (length--)
        signBits += signBit
    return signBits + binedImm
}
function twoComplement(number) {
    let oneComplement = [], code
    number.split('').forEach((bit) => {
        oneComplement.push(bit == '0' ? '1' : '0')
    })
    let decNumber = parseInt(oneComplement.join(''), 2);
    decNumber += 1
    code = decNumber.toString(2)
    if (code.length != oneComplement.length)
        code = '0' + code
    return code
}