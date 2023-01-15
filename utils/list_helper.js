const dummy = (blogs) => {
	return 1;
}

const totalLikes = (blogs) => {
	let total = 0;
	
	blogs.forEach(blog => {
		total += blog.likes
	});

	return total
}

const favoriteBlog = (blogs) => {
	let favTotal = 0;
	let favBlog = null;

	blogs.forEach(blog => {
		if(blog.likes > favTotal){
			favBlog = blog;
			favTotal = blog.likes;
		}
	})

	return favBlog;
}

module.exports = {
	dummy, totalLikes, favoriteBlog
}

