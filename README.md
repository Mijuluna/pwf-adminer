Tool for simple model manipulation. Able to create lists with filters and pagination, editors and other detailed views used to manage database model data

# Requirements

List of base requirements. Remember that these libs require something as well.

* [pwf-locales](https://github.com/just-paja/pwf-locales)
* [pwf-models-schema](https://github.com/just-paja/pwf-models-schema)
* [pwf-form-models](https://github.com/just-paja/pwf-form-models)
* [pwf-input-file](https://github.com/just-paja/pwf-input-file)
* [pwf-input-collection](https://github.com/just-paja/pwf-input-collection)
 
# Install

```bash
bower install pwf-adminer
```

Adminer has a lot of dependencies, so it might look very ugly using static HTML. When using frameworks like [fudjan](https://github.com/just-paja/fudjan) or [django](https://github.com/just-paja/django-rape) can simplify the inclusion a lot. Remember, that good guys concatenate and minify their javascripts.

So here use from fudjan template. Fudjan includes all files defined librarys' package.json.
```php
<?php
	$ren->content_for('scripts', 'bower/jquery/dist/jquery.js');
	$ren->content_for('scripts', 'bower/moment/moment.js');
	$ren->content_for('scripts', 'bower/async/lib/async.js');

	$ren->content_for('scripts', 'bower/pwf.js');
	$ren->content_for('scripts', 'bower/pwf-jquery-compat');
	$ren->content_for('scripts', 'bower/pwf-moment-compat');
	$ren->content_for('scripts', 'bower/pwf-async-compat');
	
	$ren->content_for('scripts', 'bower/pwf-config');
	$ren->content_for('scripts', 'bower/pwf-queue');
	$ren->content_for('scripts', 'bower/pwf-locales');
	$ren->content_for('scripts', 'bower/pwf-comm');
	$ren->content_for('scripts', 'bower/pwf-comm-form');
	$ren->content_for('scripts', 'bower/pwf-form');
	$ren->content_for('scripts', 'bower/pwf-form-models');
	$ren->content_for('scripts', 'bower/pwf-models');
	$ren->content_for('scripts', 'bower/pwf-models-schema');
	
	$ren->content_for('scripts', 'bower/pwf-input-file');
	$ren->content_for('scripts', 'bower/pwf-input-autocompleter');
	$ren->content_for('scripts', 'bower/pwf-input-collection');
```

# Usage

Adminer is separated into 5 objects that handle operations. [Adminer](#adminer), [List](#list), [Obvious](#obvious), [Editor](#editor) and [Destroyer](#destroyer)

## Adminer
This is only a wrapper for remaining four objects. It renders them inside of itself with nice menu.

### adminer#clear()
Clears adminers' content

### adminer#list(next)
Clears content and load list of objects. Calls next in context of new list when finished.

### adminer#create(data, next)
Clears content and shows editor for new object with ```data```. Calls ```next``` in context of new editor when finished.

### adminer#edit(obj, next)
Clears content and shows editor for passed object ```obj```. Calls ```next``` in context of new editor when loaded and rendered.
```obj``` accepts integer as well as model instance

### adminer#drop(obj, next)
Clears content and shows new destroyer object for ```obj```. Calls ```next``` in context of new destroyer when preloaded and rendered.


## List
DOM object capable of loading and displaying table of model instance objects with predefined attributes, filters and pagination. It inherits from [model.list](http://github.com/just-paja/pwf-model), [adminer.abstract.common](adminerabstractcommon) and [adminer.abstract.filters](#adminerabstractfilters).

### Attributes
List has no own attributes. Everything is inherited. Here is an example config
```javascript
{
	'parent':pwf.jquery('body'),
	'model':'NameOfYourModel',
	'attrs':null,
	'actions':['edit', 'drop'],
	'exclude':['name', 'created_at'],
	'filters':[{'attr':'ass', 'type':'gte', 'gte':50}],
	'ui_filters':['name'],
	'page':0,
	'per_page':5,
	'on_load':function() {
 		v('hello');
	}
}
```


## Obvious
DOM object capable of loading and displaying structure of data of model instance with predefined attributes. It inherits from [adminer.abstract.object](#adminerabstractobject).


## Editor
DOM object capable of displaying object editor and preloading necessary data. It inherits from [adminer.abstract.object](#adminerabstractobject).

### Attributes
```javascript
{
	// List of attributes to replace for input definition of attr
	'inputs':{
		'name':{
			'type':'text',
			'max_length':15
		}
	},
	
	// List of button definition
	'buttons':[]
}
```

### get_inputs()
Returns list of input definitions as defined by user.

```
console.log(editor.get_inputs());

[
	{
		'type':'text',
		'name':'name',
		'required':true
	},
	...
]
```

### get_attr_input_extra(name)
Returns data from ```#inputs``` attr if available for ```name``` or null

### get_buttons()
Returns list of button definitions

### get_calls()
Returns form callbacks for this object

### get_url()
Returns URL to send POST to.

### get_form_data()
Returns data object to be passed to [form](http://github.com/just-paja/pwf-form) created inside


## Destroyer
DOM object capable of preloading model instance data and relations and displaying simple prompt with question "Do you really want to delete this?". It inherits from [adminer.abstract.object](#adminerabstractobject).

### Attributes
```javascript
{
	// Callback after drop request - successful or otherwise
	'after_drop':function(err, data) {
		console.log(this.get_url());
	},
	
	// List of button definitions
	'buttons':[]
}
```

### get_url()
Returns URL to send the drop request to

### drop(next)
Send drop request to the server


## Abstraction
Objects used to inherit from. They mostly have protected methods.

### adminer.abstract.common
Used for all adminer objects. It inherits from [domel](http://github.com/just-paja/pwf.js) and [caller](http://github.com/just-paja/pwf.js).

#### Attributes
```javascript
{
	// List of actions to render right of item. Column will be omitted if null
	// or empty
	'actions':['info', 'edit', 'drop']
 
	// List of attributes (strings) to display for each item on the list. Displays 
	// all if null.
	'attrs':['name_first', 'name_last', 'birth_date']
 
	// List of attributes (strings) to exclude from display. Has higher priority
	// than 'attrs'. This example never displays birth_date
	'exclude':['birth_date']
}
```

#### get_attrs()
Returns list of definitions of attributes to use

### adminer.abstract.filters
Used only for ```adminer.list```. Creates filters according to definition passed to ```ui_filters```. To decide which input will be shown, `form.input_from_attr` is used.

#### Attributes
```javascript
{
 // List of attribute names (string) or input definitions (Object)
 'ui_filters':[
  'name', 'birth_date', {
   // ... input definition
  }
 ]
}
```

#### Input definition
Options are passed directly to input. There are two special options.

```javascript
{
 // An OR query will be generated for value of this input
 'attrs':['list', 'of', 'attribute', 'names'],
 
 // This function will be used to determine the input value
 'get_filter':function() {
  return this.val();
 }
}
```

### adminer.abstract.object
Used for all adminer objects that work with one item. It inherits from [adminer.abstract.common](#adminerabstractcommon).

#### Attributes
```javascript
{
 // Should this object reload all data after some operation (save/drop)
 // The reload time counts before firing after_load
 'reload':false,
  
 // Object to examine. Can be ID or model instance
 'item':1,
 
 // List of relations to preload before firing after_load
 'preload':['this_model_relation_attr_name', 'this_model_relation.related_relation']
}
```

