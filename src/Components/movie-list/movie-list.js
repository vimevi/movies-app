import { Component } from 'react';
import PropTypes from 'prop-types';

import './movie-list.scss';

import MovieItem from '../movie-item/movie-item';
import Spinner from '../spinner';
import { Alert } from 'antd';

export default class MovieList extends Component {
	render() {
		const {
			movieData,
			loading,
			genresData,
			searchComlited,
			value,
			onAddRating,
		} = this.props;

		if (loading) {
			return <Spinner />;
		}
		return (
			<ul className="movies-list">
				{movieData?.results && movieData.results.length && value !== '' > 0
					? movieData.results.map((movie) => (
							<MovieItem
								onAddRating={onAddRating}
								key={movie.id}
								movie={movie}
								genresData={genresData}
							/>
					  ))
					: searchComlited &&
					  value !== '' &&
					  movieData.results.length === 0 &&
					  !loading && (
							<Alert
								message={
									<>
										По заросу <strong>{value}</strong> ничего не найдено.
										Попробуйте найти что-то ещё.
									</>
								}
								showIcon={true}
								type="warning"
							></Alert>
					  )}
			</ul>
		);
	}
}

MovieList.propTypes = {
	movieData: PropTypes.object,
	loading: PropTypes.bool.isRequired,
	genresData: PropTypes.object,
	searchComlited: PropTypes.bool,
	value: PropTypes.string,
	onAddRating: PropTypes.func,
	ratedMovies: PropTypes.object,
};
