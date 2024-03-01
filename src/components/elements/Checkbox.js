import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';


const Checkbox = ({checked, size='m', clickAction=null}) => {

    const [isChecked, setIsChecked] = useState(checked)

    useEffect(() => {
        setIsChecked(checked);
    }, [checked])

    const handleClick = () => {
        if (clickAction) clickAction();
    }

	return (
		<div 
            className={`task-checkbox ${isChecked ? 'checked' : 'unchecked'} task-checkbox--${size}`} onClick={handleClick}>
            { isChecked &&
                <FontAwesomeIcon icon={faCheck} className='checkmark'></FontAwesomeIcon>
            }
        </div>
    );
};

export default Checkbox;