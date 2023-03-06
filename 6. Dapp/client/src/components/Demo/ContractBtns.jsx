import { useState } from 'react';
import useEth from '../../contexts/EthContext/useEth';

function ContractBtns({ setValue, setText }) {
    const {
        state: { contract, accounts }
    } = useEth();
    const [inputValue, setInputValue] = useState('');
    const [textValue, setTextValue] = useState('');

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleTextChange = (e) => {
        setTextValue(e.target.value);
    };

    const read = async () => {
        const value = await contract.methods.read().call({ from: accounts[0] });
        setValue(value);
    };

    const write = async (e) => {
        if (e.target.tagName === 'INPUT') {
            return;
        }
        if (inputValue === '') {
            alert('Please enter a value to write.');
            return;
        }
        const newValue = parseInt(inputValue);
        await contract.methods.write(newValue).send({ from: accounts[0] });
    };

    const greet = async () => {
        const value = await contract.methods.greet().call({ from: accounts[0] });
        setText(value);
    };

    const setGreeter = async (e) => {
        if (e.target.tagName === 'INPUT') {
            return;
        }
        if (textValue === '') {
            alert('Please enter a value to write.');
            return;
        }
        const newValue = textValue;
        await contract.methods.setGreeter(newValue).send({ from: accounts[0] });
    };

    return (
        <div className="btns">
            <button onClick={read}>read()</button>

            <div onClick={write} className="input-btn">
                write(
                <input type="text" placeholder="uint" value={inputValue} onChange={handleInputChange} />)
            </div>

            <button onClick={greet}>greet()</button>

            <div onClick={setGreeter} className="input-btn">
                setGreeter(
                <input type="text" placeholder="uint" value={textValue} onChange={handleTextChange} />)
            </div>
        </div>
    );
}

export default ContractBtns;
