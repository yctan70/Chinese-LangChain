Sub TwoPointTeach()
	Dim theta1 as double
	Dim theta3 as double
	Dim Xorg[2] as double
	Dim Yorg[2] as double
	Dim idx as integer
	Dim db_file as FileSystem		
	Dim Xo as double
	Dim Yo as double
	Dim Xn as double
	Dim Yn as double
	Dim Tn as double
	Dim Td as double
	Dim Ln as double
	Dim cos_sum as double
	Dim sin_sum as double
	Dim cos_sub as double
	Dim sin_sub as double
	Dim gPcbPointX[2], gPcbPointY[2] as double

	print "===== TwoPointTeach ====="
	gPcbPointX[0] = gMarkX[gPlatformSide, 0]
	gPcbPointY[0] = gMarkY[gPlatformSide, 0]
	gPcbPointX[1] = gMarkX[gPlatformSide, 1]
	gPcbPointY[1] = gMarkY[gPlatformSide, 1]
			
	theta1 = atan(Abs(gPcbPointX[1]-gPcbPointX[0])/Abs(gPcbPointY[1]-gPcbPointY[0]))/RAD
	print "theta1=", theta1
			
	if (gPlatformEnum = T_000) or (gPlatformEnum = B_000) then
		theta3 = atan(Abs(gArmPointY[1]-gArmPointY[0])/Abs(gArmPointX[1]-gArmPointX[0]))/RAD		
	else
		theta3 = atan(Abs(gArmPointX[1]-gArmPointX[0])/Abs(gArmPointY[1]-gArmPointY[0]))/RAD		
	end if
	print "theta3=", theta3

	if gPcbPointX[1] > gPcbPointX[0] then
		' Zagato Top FD2 > FD3
		' Zagato Bottom FD4 > FD6
		' Zenvo Bottom no_refdes+6 > TP32
		'theta_d = theta3 - theta1 
		Td = theta3 - theta1
	else
	        ' Zenvo TP15 < TP19
		'theta_d = theta1 - theta3
		Td = theta1 - theta3
	end if

	gThetaDs = Td
	
	print "ThetaD=", gThetaDs
				
	' new version
	for idx = 0 to 1	
		Xn = gArmPointX[idx]
		Yn = gArmPointY[idx]
		Ln = hypot(gPcbPointX[idx], gPcbPointY[idx])
		Tn = atan(Abs(gPcbPointX[idx]/gPcbPointY[idx]))/RAD
		cos_sum = Ln * cos((Tn + Td) * RAD)
		cos_sub = Ln * cos((Tn - Td) * RAD)
		sin_sum = Ln * sin((Tn + Td) * RAD)
		sin_sub = Ln * sin((Tn - Td) * RAD)
		
		if gPlatformEnum = T_000 then
			if (gPcbPointX[idx] > 0) and (gPcbPointY[idx] > 0) then ' Quadrant 1
				Xo = Xn + cos_sub
				Yo = Yn - sin_sub
			elseif (gPcbPointX[idx] < 0) and (gPcbPointY[idx] > 0) then ' Quadrant 2
				Xo = Xn + cos_sum
				Yo = Yn + sin_sum
			elseif (gPcbPointX[idx] < 0) and (gPcbPointY[idx] < 0) then ' Quadrant 3
				Xo = Xn - cos_sub
				Yo = Yn + sin_sub			
			else ' Quadrant 4
				Xo = Xn - cos_sum
				Yo = Yn - sin_sum								
			end if
'		elseif gPlatformEnum = A_90 then
'			if (gPcbPointX[idx] > 0) and (gPcbPointY[idx] > 0) then ' Quadrant 1
'				Xo = Xn + sin_sub
'				Yo = Yn + cos_sub
'			elseif (gPcbPointX[idx] < 0) and (gPcbPointY[idx] > 0) then ' Quadrant 2
'				Xo = Xn - sin_sum
'				Yo = Yn + cos_sum
'			elseif (gPcbPointX[idx] < 0) and (gPcbPointY[idx] < 0) then ' Quadrant 3
'				Xo = Xn - sin_sub
'				Yo = Yn - cos_sub			
'			else ' Quadrant 4
'				Xo = Xn + sin_sum
'				Yo = Yn - cos_sum								
'			end if							
		elseif gPlatformEnum = B_000 then
			if (gPcbPointX[idx] > 0) and (gPcbPointY[idx] > 0) then ' Quadrant 1
				Xo = Xn + cos_sub
				Yo = Yn + sin_sub
			elseif (gPcbPointX[idx] < 0) and (gPcbPointY[idx] > 0) then ' Quadrant 2
				Xo = Xn + cos_sum
				Yo = Yn - sin_sum
			elseif (gPcbPointX[idx] < 0) and (gPcbPointY[idx] < 0) then ' Quadrant 3
				Xo = Xn - cos_sub
				Yo = Yn - sin_sub			
			else ' Quadrant 4
				Xo = Xn - cos_sum
				Yo = Yn + sin_sum								
			end if									
'		elseif gPlatformEnum = B_90 then
'			if (gPcbPointX[idx] > 0) and (gPcbPointY[idx] > 0) then ' Quadrant 1
'				Xo = Xn - sin_sub
'				Yo = Yn + cos_sub
'			elseif (gPcbPointX[idx] < 0) and (gPcbPointY[idx] > 0) then ' Quadrant 2
'				Xo = Xn + sin_sum
'				Yo = Yn + cos_sum
'			elseif (gPcbPointX[idx] < 0) and (gPcbPointY[idx] < 0) then ' Quadrant 3
'				Xo = Xn + sin_sub
'				Yo = Yn - cos_sub			
'			else ' Quadrant 4
'				Xo = Xn - sin_sum
'				Yo = Yn - cos_sum								
'			end if											
		end if
		Xorg[idx] = Xo
		Yorg[idx] = Yo
		print "ORG[", idx, "]=( ", Xo, " , ", Yo, " )"
	next idx
		
	LetX ORG_POSITION = (Xorg[0] + Xorg[1])/2
	
	LetY ORG_POSITION = (Yorg[0] + Yorg[1])/2
	
	print "ORG_POSITION=", ORG_POSITION
	
	RefreshHmiOrgPos()
End Sub

Sub GetPreciseOffset(byval arm_id as integer, byval x_sym as double, byval y_sym as double, byref x_offset as double, byref y_offset as double)
	Dim Xn as double
	Dim Yn as double
	Dim Tr as double
	
	Tr = gThetaDs * RAD
	
	Xn = x_sym * cos(Tr) - y_sym * sin(Tr)	
	Yn = y_sym * cos(Tr) + x_sym * sin(Tr)
	
	if gPlatformEnum = T_000 then
		x_offset = (-1) * Yn
		y_offset = Xn
		print "A00, Precise Offset:(", x_offset, ",", y_offset, ")"
'	elseif gPlatformEnum = A_90 then
'		x_offset = (-1) * Xn
'		y_offset = (-1) * Yn	
'		print "A90, Precise Offset:(", x_offset, ",", y_offset, ")"
	elseif gPlatformEnum = B_000 then
		x_offset = (-1) * Yn
		y_offset = (-1) * Xn
		print "B00, Precise Offset:(", x_offset, ",", y_offset, ")"
'	elseif gPlatformEnum = B_90 then
'		x_offset = Xn
'		y_offset = (-1) * Yn		
'		print "B90, Precise Offset:(", x_offset, ",", y_offset, ")"
	end if 
End Sub