import { useRef, useEffect } from 'react';

function Contract({ value, text }) {
    const spanEle = useRef(null);

    return (
        <code>
            {`contract SimpleStorage {
  uint256 value = `}

            <span className="secondary-color" ref={spanEle}>
                <strong>{value}</strong>
            </span>

            {`;

    string greet = `}

            <span className="secondary-color" ref={spanEle}>
                <strong>{text}</strong>
            </span>

            {`;

  function read() public view returns (uint256) {
    return value;
  }

  function write(uint256 newValue) public {
    value = newValue;
  }
}`}
        </code>
    );
}

export default Contract;
