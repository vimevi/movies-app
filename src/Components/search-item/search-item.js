import { Component } from 'react';
import PropTypes from 'prop-types';

import './search-item.scss';

export default class SearcItem extends Component {
	render() {
		const { value, onInputChange } = this.props;
		return (
			<div>
				<form>
					<input
						type="text"
						placeholder="Введите для поиска.."
						onChange={onInputChange}
						autoFocus
					/>
				</form>
				{value === '' && <div className="what-find">Что ищем сегодня?</div>}
			</div>
		);
	}
}

SearcItem.propTypes = {
	fetchMovieData: PropTypes.func.isRequired,
	onInputChange: PropTypes.func.isRequired,
	value: PropTypes.string.isRequired,
};
