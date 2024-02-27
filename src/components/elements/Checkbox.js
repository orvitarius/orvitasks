import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';


const Checkbox = ({checked, clickAction=null}) => {
    const [isChecked] = useState(checked)

    const handleClick = () => {
        if (clickAction) clickAction();
    }

	return (
		<div 
            className={`task-checkbox ${isChecked ? 'checked' : 'unchecked'}`} onClick={handleClick}>
            { isChecked &&
                <FontAwesomeIcon icon={faCheck} className='checkmark'></FontAwesomeIcon>
            }
        </div>
    );
};

export default Checkbox;