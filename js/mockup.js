Foods = new Mongo.Collection("fuuditest");
Visitors = new Mongo.Collection("visitors");
var imageStore = new FS.Store.GridFS("images");

Images = new FS.Collection("images", {
	stores: [imageStore],
	filter: {
		maxSize: 204800, // 200kB
		allow: {
			contentTypes: ['image/*'],
			extensions: ['png', 'jpg', 'jpeg']
		},
		onInvalid: function(message) {
			if (Meteor.isClient) {
		        alert(message);
		    } else {
		        console.log(message);
		    }
		}
	},
});

PlayersIndex = new EasySearch.Index({
	collection: Foods,
	fields: ['name', 'kategoria'],
	engine: new EasySearch.MongoDB(),
	defaultSearchOptions: {
    	limit: 20
  	}
});

Meteor.methods({
	'fuuditest.insert'(name, energy, carbs,
		sugar, fat, salt, prot, fiber, file_id, category) {
		// Make sure the user is logged in before inserting a task
    	if (! Meteor.userId()) {
      		throw new Meteor.Error('not-authorized');
    	}

    	Foods.insert({
      		name: name,
      		kategoria: category,
      		energia: energy,
      		hiilihydraatti: carbs,
      		sokerit: sugar,
      		rasva: fat,
      		suola: salt,
      		proteiini: prot,
      		kuitu: fiber,
      		createdAt: new Date(),
      		owner: Meteor.userId(),
      		username: Meteor.user().username,
      		image_id: file_id
    	});
	},
	'visitors.insert'(user_agent) {
		Visitors.insert({
			agent: user_agent
		});
	},
});

if (Meteor.isClient) {

	// function init() {
	//     window.addEventListener('scroll', function(e){
	//         var distanceY = window.pageYOffset || document.documentElement.scrollTop,
	//             shrinkOn = 80,
	//             header = document.querySelector("header");
	//         if (distanceY > shrinkOn) {
	//             classie.add(header,"smaller");
	//         } else {
	//             if (classie.has(header,"smaller")) {
	//                 classie.remove(header,"smaller");
	//             }
	//         }
	//     });
	// }
	// window.onload = init();

	Template.login.events({
	    'click #facebook-login': function(event) {
	        Meteor.loginWithFacebook({}, function(err){
	            if (err) {
	                throw new Meteor.Error("Facebook login failed");
	            }
	        });
	    },
	 
	    'click #logout': function(event) {
	        Meteor.logout(function(err){
	            if (err) {
	                throw new Meteor.Error("Logout failed");
	            }
	        })
	    }
	});

	Template.food.events({
		// Clear search input and results when the user clicks on an itemlink
		'click a.fooditem-link': function(event) {
			PlayersIndex.getComponentMethods().search("");
		},
	});

	Template.foodform.events({
		'submit form': function(event, template) {
			// Prevent default browser form submit
    		event.preventDefault();

    		var file_id;

	        Images.insert(event.target.image.files[0], function (err, fileObj) {
				if (err){
					// handle error
					console.log(err);
				} else {
					// handle success depending what you need to do
					file_id = fileObj._id;

					// Get values from form element
		    		const target = event.target;

		    		const name = target.name.value;
		    		const energy = target.energy.value;
		    		const carbs = target.carbs.value;
		    		const sugar = target.sugar.value;
		    		const fat = target.fat.value;
		    		const salt = target.salt.value;
		    		const prot = target.prot.value;
		    		const fiber = target.fiber.value;
		    		const category = target.category.value;

				    Meteor.call('fuuditest.insert', name, energy, carbs, 
				    	sugar, fat, salt, prot, fiber, file_id, category);

				    // Clear form
		    		target.name.value = '';
				}
     		});
		},
	});

	Template.registerHelper('calories', function(kj) {
		return (kj / 4.184).toFixed(1);
	});

	Template.registerHelper('getImageFromId', function(id) {
		Meteor.subscribe('images')
		var image = Images.findOne({_id: id});
		if (image === undefined) {
			return '/svg/food-icons/cutlery-1.svg';
		}else{
			return image.url();
		}
	});

	Template.foodform.onRendered(function() {

		$('.food-form-body').validate({
			messages: {
				name: 'Required'
			}
		});

		var inputs = document.querySelectorAll( '.myFileInput' );
		Array.prototype.forEach.call( inputs, function( input )
		{
			var label	 = input.nextElementSibling,
				labelVal = label.innerHTML;

			input.addEventListener( 'change', function( e )
			{
				var fileName = '';
				fileName = e.target.value.split( '\\' ).pop();
				if (fileName === '') {
					fileName = 'lataa kuva';
				}
				label.querySelector( 'span' ).innerHTML = fileName;
			});
		});
	});

	Template.header.onRendered(function() {
		// $(window).resize(function() {
		// 	if($(document).width() > 730) {
		// 		$('#search-wrap').show();
		// 	}else{
		// 		$('#search-wrap').hide();
		// 	}
		// });

		$('.site-wrap').click(function() {
			$('#nav-trigger').prop('checked', false);
		});
	});

	Template.foodform.helpers({
		distinct_categories() {

			var ready = Meteor.subscribe('fuuditest').ready();
			var allCategories;

			var allFood = Foods.find({},  {
			    sort: {kategoria: 1}, fields: {kategoria: true}
			});

			if (ready) {
				var result = [];
				allCategories = allFood.map( function(x) {return x.kategoria;});
				
				for (var c in allCategories) {
					if (allCategories[c] !== undefined && allCategories[c] !== "") {
						result[result.length] = allCategories[c];
					}
				}
			}

			return {
				categories: _.uniq(result),
				ready: ready
			};
		},
	});

	Template.foodsearch.helpers({
  		playersIndex: () => PlayersIndex, // instanceof EasySearch.Index
  		inputAttributes: function () {
      		return { 'class': 'easy-search-input', 'placeholder': 'Haku...' };
    	} 
	});

	Template.imageView.helpers({
		images: function () {
			Meteor.subscribe('images')
			return Images.find(); // Where Images is an FS.Collection instance
		}
	});

	Template.categories.helpers({
		distinct_categories() {

			var ready = Meteor.subscribe('fuuditest').ready();
			var allCategories;

			var allFood = Foods.find({},  {
			    sort: {yläkategoria: 1}, fields: {yläkategoria: true}
			});

			if (ready) {
				var result = [];
				allCategories = allFood.map( function(x) {return x.yläkategoria;});

				var unique_categories = _.uniq(allCategories);
				
				for (var c in unique_categories) {
					if (unique_categories[c] !== undefined && unique_categories[c] !== "") {
						result[result.length] = unique_categories[c];
					}
				}
			}

			return {
				categories: result,
				ready: ready
			};
		}
	});

	Template.header.events({
		'click .searchtoggle': function(event) {
			$('#search-wrap').fadeToggle(100);
			//$('.searchtoggle').toggleClass('active');
		},
	});
}

if (Meteor.isServer) {
	Meteor.startup(function () {

	});

	Meteor.publish('fuuditest', function() {
		return Foods.find({}); 
	});

	Meteor.publish('images', function() {
		return Images.find({}); 
	});

	Meteor.publish('getVisitorCount', function() {
		return Visitors.find();
	});

	Foods.allow({
		insert: function (userId, doc) {
			// the user must be logged in, and the document must be owned by the user
			return (userId && doc.owner === userId);
		},
		update: function (userId, doc, fields, modifier) {
			// can only change your own documents
			return doc.owner === userId;
		},
		remove: function (userId, doc) {
			// can only remove your own documents
			return doc.owner === userId;
		},
		fetch: ['owner']
	});

	Visitors.allow({
		insert: function (userId, doc) {
			// the user must be logged in, and the document must be owned by the user
			return (userId && doc.owner === userId);
		},
	});

	Images.allow({
		insert: function (userId) {
			return (userId);
		},
		update: function (userId) {
			// can only change your own documents
			return (userId);
		},
    	download: function(userId, fileObj) {
        	return (userId);
    	},
	});
}