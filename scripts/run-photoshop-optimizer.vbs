Option Explicit

Dim photoshop
Set photoshop = CreateObject("Photoshop.Application")
photoshop.DoJavaScriptFile "D:\Documents\newMySiteV2\scripts\photoshop-optimize-catalog.jsx"
Set photoshop = Nothing
