if (Meteor.isClient) {

	Template.foods.events({
		'click .fab': function(event) {
			Router.go('/foods/add')
		},
	});

	Template.food.events({
		'click .fab': function(event) {
			Router.go('/foods/add')
		},
	});

	Template.categories.events({
		'click .fab': function(event) {
			Router.go('/foods/add')
		},
	});

	Template.subcategories.events({
		'click .fab': function(event) {
			Router.go('/foods/add')
		},
	});
}