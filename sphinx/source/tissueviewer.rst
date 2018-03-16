.. _tissueviewer:

Tissue Viewer
=============

Tissue Viewer is used for viewing tissue that users have previously selected on the organ viewer.
Currently only heart tissue textures are available for viewing.

.. figure:: img/tissue1.png
   :width: 100 %
   :alt: Expanded view of the Tissue Viewer

   Expanded view of the Tissue Viewer with a block of 3D collagen textures on display: 
   
   1) :ref:`tissuegui`
   
   2) :ref:`tissuerenderer`
   
   3) :ref:`celltypebuttons`
   
   4) :ref:`tissueInformation`
   
.. _tissuegui:

Tissue Control GUI
------------------

Controls for texture blocks selection, lower and upper bounds of the display volume can be found here.

.. _tissuerenderer:

Tissue Renderer
---------------

3D renderer of tissue, users can freely rotate, pan and zoom in/out the display.

Users may click on an interest point (blue spheres on the screenshot above)
which may trigger the :ref:`cellviewer` and :ref:`modelsviewer` to load and display related informations.

.. _celltypebuttons:

Cell Type Buttons
-----------------

Each of these buttons represents a specific type of cells, when clicked 
:ref:`cellviewer` and :ref:`modelsviewer` will load and display relevant informations.

.. _tissueInformation:

Additional Tissue Information 
-----------------------------

Clicking on this button will bring up a CellML page containing relevant cell models to the Tissue on display. 
