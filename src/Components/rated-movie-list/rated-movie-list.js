import { Component } from 'react';
import PropTypes from 'prop-types';
import MovieItem from '../movie-item/movie-item';
import Spinner from '../spinner';
import { Alert } from 'antd';

export default class RatedMovieList extends Component {
	render() {
		const {
			ratedMovies,
			loading,
			genresData,
			onAddRating,
			//  onPageChange
		} = this.props;

		if (loading) {
			return <Spinner />;
		}

		return (
			<ul className="movies-list">
				{ratedMovies && ratedMovies.results.length !== 0 ? (
					ratedMovies.results.map((movie) => (
						<MovieItem
							onAddRating={onAddRating}
							key={movie.id}
							movie={movie}
							genresData={genresData}
							rating={movie.rating}
						/>
					))
				) : (
					<Alert
						message="Оцененных фильмов не найдено."
						showIcon={true}
						type="warning"
					/>
				)}
			</ul>
		);
	}
}

RatedMovieList.defaultProps = {
	ratedMovies: {},
	genresData: {},
};

RatedMovieList.propTypes = {
	ratedMovies: PropTypes.object,
	loading: PropTypes.bool.isRequired,
	genresData: PropTypes.object,
	onAddRating: PropTypes.func.isRequired,
};
