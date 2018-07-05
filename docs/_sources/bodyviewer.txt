.. _bodyviewer:

Body Viewer
===========

The main function for the Body Viewer is to view geometry data for each system/organ.

.. figure:: img/body1.png
   :width: 100 %
   :alt: Expanded view of the Body Viewer

   Expanded view of the Body Viewer: 
   
   1) :ref:`specieschooser`
   
   2) :ref:`bodygui`
   
   3) :ref:`systemtoggle`
   
   4) :ref:`bodyrenderer`
   
   
.. _specieschooser:

Species Chooser
---------------

This determines the species to be viewed on the portal, only "Human" is supported at this moment.

.. _bodygui:

Body Control GUI
----------------

Individual visibility settings for each organ/part can be toggled using this interface.

.. figure:: img/body2.png
   :width: 25 %
   :align: center
   :alt: Expanded view of the Body Viewer

   Expanded Body Control GUI, individual visibility settings can be toggled by clicking on the tickbox next each organ/part name.
   
Beside changing visibility of different organs/parts, basic settings that are shared between different organs/parts can be set 
using this controls such as background colour.
The GUI itself can be expanded/collapsed by pressing on the "Open Controls" and "Close Controls" buttons respectively.

.. _systemtoggle:

Body System Toggle
------------------

Clicking on these buttons toggles the visibility of all parts/organs of a system on/off. 

.. _bodyrenderer:

Body Renderer
-------------

Users can zoom in/out, pan and rotate the geometry data. Name of the part/organ is displayed when a cursor hovers over it.
When a organ/part is clicked, a corresponding model will be opened on the :ref:`organviewer`. 
