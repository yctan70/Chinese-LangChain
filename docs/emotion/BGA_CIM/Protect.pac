Sub SetFatalErrBreak(byval err_msg as string, byval msg_idx as integer)
	ShortBuzzer(3)	
	MessagePopup(msg_idx)
End Sub

Sub SetFatalErrBreak2(byval err_msg as string)
	ShortBuzzer(3)
	MessageDisplay(err_msg)
End Sub