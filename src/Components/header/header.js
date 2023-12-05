import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Header extends Component {
	render() {
		const { activeTab, onTabChange } = this.props;

		return (
			<header>
				<div>
					<span
						className={activeTab === 'search' ? 'active-tab' : ''}
						onClick={() => onTabChange('search')}
					>
						Поиск
					</span>
					<span
						className={activeTab === 'rated' ? 'active-tab' : ''}
						onClick={() => onTabChange('rated')}
					>
						Оценено
					</span>
				</div>
			</header>
		);
	}
}

Header.propTypes = {
	onTabChange: PropTypes.func,
	activeTab: PropTypes.string,
};
