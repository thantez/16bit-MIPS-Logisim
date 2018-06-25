# 16bit-MIPS-Logisim
Emulating MIPS special instructions in 5 stage pipeline in logisim with minimal assembler
recreated fork of [MIPS-Logisim](https://github.com/jsingh07/MIPS-Logisim)

instructions and their opCode saved in definedCodes.json in assembly folder
for run assembler, first install node.js
then run this command in assembly folder:
`node index.js <input assembly codes file> <address of output hex codes file>`
for examle:
`node index.js ../program.a ../program.hex`

sample assembly program in program.a is a program that puts numbers 0...5 in blocks 0..5 of memory and then calculate sum of them by reading values from memory