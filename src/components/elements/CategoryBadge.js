import React from 'react';

const CategoryBadge = ({ categoryObj, removeAction, showRemove=false, customClass, clickCallback, plusClickAction, selected, size = 'm' }) => {
	if (!categoryObj) return (<div/>)


	const sizes = ['s', 'm', 'l'];
	if (sizes.indexOf(size) === -1) size = 'm';

	const clickAction = () => {
		if (clickCallback) {
			clickCallback(categoryObj);
		}
	}

	return (
		<div 
			className={
				`cat-badge 
				${customClass ? customClass : ''} 
				${selected ? 'cat-badge--selected' : '' } 
				${categoryObj.new ? 'cat-badge--new' : ''}
				${size ? 'cat-badge--' + size : ''}
			`}
			>

			<div className='label' 
				onClick={ () => clickAction(categoryObj) } 
				style={{ backgroundColor : categoryObj.color, color : categoryObj.textColor ? categoryObj.textColor : 'antiquewhite'  }}
			>{ categoryObj.key }
			</div>

			{showRemove && <div className='badge removeButton' onClick={ () => removeAction(categoryObj) }>-</div>}
			{categoryObj.new && <div className='badge newCat' onClick={ () => plusClickAction(categoryObj) }>+</div>}
		</div>
  );
};

export default CategoryBadge;