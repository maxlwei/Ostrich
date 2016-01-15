# Ostrich
This is a GLSL running animation for an Ostrich, including torso, neck and head movement.
The joints are all animated by directly manipulating object matrices.
It also contains a number of still poses by pressing the nubmers 1-5 and 0 for the running animation.

There are two pairs of vertex and fragment shaders, one for the torso and one for the general skin tone

The torso shader has animated feather movement simulated by using cos to 'randomize' vertex displacements, which are then moved up and down. It also shades the back area of the ostrich with a lighter colour and uses a simple but effective lighting method which casts light from above.

The skin shader uses a combination of the world normal values and a bit of normal based lighting added to a skin tone colour. The lower the object is placed in the world, the slightly darker it will be.

Base code by Mikhail Bessmeltsev
