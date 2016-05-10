if (Meteor.isClient) {

	Template.foods.events({
		'click .fab': function(event) {
			Router.go('/foods/add')
	    },
	    'dblclick .food-item': function (event) {
	        console.log("T foods: dblclick");
	        //console.log(this._id); console.log(this.valmistaja);
	        console.log(this.name);
	        Session.set('docID', this);
	        Router.go('/foods/edit')
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
	Template.editform.helpers({
	    formData: function () {
	        console.log("editfood helper");
	        var document = Session.get('docID');
	        console.log(document._id);
	        return document;
	        //return fuuditest.findOne({ _id: document });
	    }
	})
}